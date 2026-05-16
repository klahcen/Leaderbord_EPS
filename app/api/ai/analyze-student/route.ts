import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
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
        `${l.recordedAt.toDateString()} | ${l.category} | Score: ${l.score}/${l.maxScore}${l.notes ? ` | ${l.notes}` : ""}`
    )
    .join("\n");

  const languageInstruction = getLanguageInstruction(locale);

  const message = await claude.messages.create({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert Physical Education coach and sports analyst. ${languageInstruction}

Here is the progress data for student **${student.name}** (Class: ${student.className}, Code: ${student.studentCode}):

\`\`\`
${logsSummary || "No progress logs recorded yet."}
\`\`\`

Please provide:
1. **Overall Assessment** — strengths and notable improvements
2. **Weakest Areas** — categories where the student needs the most work
3. **Trend Analysis** — is the student improving, declining, or plateauing?
4. **Personalized Training Plan** — 3 specific weekly recommendations to help this student improve
5. **Motivational Note** — a short encouraging message for the student

Be specific and data-driven. Reference actual scores in your analysis. Keep it concise (under 400 words). Use markdown formatting.`,
      },
    ],
  });

  const analysis =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ analysis });
}
