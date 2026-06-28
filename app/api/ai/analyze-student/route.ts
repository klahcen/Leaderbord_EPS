import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateText,
  formatGeminiError,
  isGeminiConfigured,
} from "@/lib/gemini";
import { getLanguageInstruction } from "@/lib/claude-language";
import { formatScoreForAI } from "@/lib/ai/qualitative-context";
import { getQualitativeGradingInstruction } from "@/lib/utils/qualitative-grades";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { studentId, locale = "en" } = await req.json();
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      schoolClass: true,
      progressLogs: {
        orderBy: { recordedAt: "desc" },
        take: 50,
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const logsSummary = student.progressLogs
    .map(
      (l) =>
        `${l.recordedAt.toDateString()} | ${l.knowledgeDomain}/${l.criteria} | Appréciation: ${formatScoreForAI(l.score, l.iacMax, locale)} (S${l.semester})${l.notes ? ` | ${l.notes}` : ""}`
    )
    .join("\n");

  const languageInstruction = getLanguageInstruction(locale);
  const gradingInstruction = getQualitativeGradingInstruction(locale);

  try {
    const analysis = await generateText({
      maxOutputTokens: 1024,
      prompt: `You are an expert Physical Education coach and sports analyst. ${languageInstruction}
${gradingInstruction}

Here is the progress data for student **${student.name}** (Class: ${student.schoolClass?.name ?? "No class"}, Code: ${student.studentCode}):

\`\`\`
${logsSummary || "No progress logs recorded yet."}
\`\`\`

Please provide:
1. **Overall Assessment** — strengths and notable improvements
2. **Weakest Areas** — categories where the student needs the most work
3. **Trend Analysis** — is the student improving, declining, or plateauing?
4. **Personalized Training Plan** — 3 specific weekly recommendations to help this student improve
5. **Motivational Note** — a short encouraging message for the student

Be specific and data-driven. Reference qualitative appreciation levels in your analysis. Keep it concise (under 400 words). Use markdown when helpful.`,
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    return NextResponse.json(
      { error: formatGeminiError(err, locale) },
      { status: 502 }
    );
  }
}
