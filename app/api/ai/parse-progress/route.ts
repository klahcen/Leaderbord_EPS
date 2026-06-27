import { NextRequest, NextResponse } from "next/server";
import type { ActivityFamily, SubActivity } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  generateStructuredJson,
  formatGeminiError,
  isGeminiConfigured,
} from "@/lib/gemini";
import { getLanguageInstruction } from "@/lib/claude-language";
import {
  extractProgressSchema,
  type ExtractedProgress,
} from "@/lib/ai/tools";
import {
  getFamilyEvaluationDefaults,
  getFamilyForSubActivity,
  IAC_MAP,
} from "@/lib/activity-config";

const ACTIVITY_HINT = `
Valid families and sub-activities (Moroccan EPS program):
- ATHLETISME: COURSE_VITESSE, COURSE_HAIES, COURSE_RELAIS, COURSE_ENDURANCE, SAUT_LONGUEUR, SAUT_HAUTEUR, TRIPLE_SAUT, LANCER_POIDS, LANCER_DISQUE, LANCER_JAVELOT
- SPORTS_COLLECTIFS: FOOTBALL, BASKETBALL, HANDBALL, RUGBY, VOLLEYBALL, BADMINTON
- GYMNASTIQUE: GYMNASTIQUE_SOL

Score is out of 14 for physical activity families.
`.trim();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { description, locale = "en" } = await req.json();
  if (!description?.trim()) {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  const languageInstruction = getLanguageInstruction(locale);

  let extracted: ExtractedProgress;
  try {
    extracted = await generateStructuredJson<ExtractedProgress>({
      schema: extractProgressSchema,
      prompt: `Extract a Moroccan PE procedural activity entry from this description. ${languageInstruction}

${ACTIVITY_HINT}

Description: "${description}"

Return JSON with family, subActivity, score (0-14), notes, and confidence.
subActivity must belong to the chosen family.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: formatGeminiError(err, locale) },
      { status: 502 }
    );
  }

  if (!extracted?.subActivity || !extracted?.family) {
    return NextResponse.json(
      {
        error:
          "Could not parse description — try being more specific about the activity and score.",
      },
      { status: 400 }
    );
  }

  const subActivity = extracted.subActivity as SubActivity;
  const familyFromSub = getFamilyForSubActivity(subActivity);
  const family = (extracted.family as ActivityFamily) ?? familyFromSub;

  if (familyFromSub !== family) {
    return NextResponse.json(
      {
        error: `Sub-activity "${subActivity}" does not belong to family "${family}".`,
      },
      { status: 400 }
    );
  }

  const defaults = getFamilyEvaluationDefaults(family);
  const iacMax = IAC_MAP[family] ?? 14;
  const score = Math.min(Math.max(0, Number(extracted.score) || 0), iacMax);

  return NextResponse.json({
    extracted: {
      family,
      subActivity,
      knowledgeDomain: defaults.knowledgeDomain,
      criteria: defaults.criteria,
      definition: defaults.definition,
      tool: defaults.tool,
      iacMax,
      score,
      notes: extracted.notes ?? "",
      confidence: extracted.confidence,
    },
    family,
    subActivity,
    score,
    iacMax,
    notes: extracted.notes ?? "",
    confidence: extracted.confidence,
  });
}
