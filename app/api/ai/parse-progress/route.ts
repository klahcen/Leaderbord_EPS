import { NextRequest, NextResponse } from "next/server";
import type { ActivityFamily, SubActivity } from "@prisma/client";
import { auth } from "@/lib/auth";
import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import { extractProgressTool, type ExtractedProgress } from "@/lib/ai/tools";
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

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { description, locale = "en" } = await req.json();
  if (!description?.trim()) {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  const languageInstruction = getLanguageInstruction(locale);

  let message;
  try {
    message = await claude.messages.create({
      model: CLAUDE_MODELS.SONNET,
      max_tokens: 512,
      tools: [extractProgressTool],
      tool_choice: { type: "tool", name: "extract_progress_entry" },
      messages: [
        {
          role: "user",
          content: `Extract a Moroccan PE procedural activity entry from this description. ${languageInstruction}

${ACTIVITY_HINT}

Description: "${description}"

Use the extract_progress_entry tool. subActivity must belong to the chosen family. Score must be from 0 up to 14.`,
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Claude API error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      {
        error:
          "Could not parse description — try being more specific about the activity and score.",
      },
      { status: 400 }
    );
  }

  const extracted = toolUse.input as ExtractedProgress;
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
