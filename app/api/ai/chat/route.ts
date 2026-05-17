import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import { prisma } from "@/lib/prisma";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { messages = [], question, locale = "en" } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const [studentCount, recentLogs, allStudents] = await Promise.all([
    prisma.student.count(),
    prisma.progressLog.findMany({
      take: 20,
      orderBy: { recordedAt: "desc" },
      include: { student: { select: { name: true, schoolClass: { select: { name: true } } } } },
    }),
    prisma.student.findMany({
      include: {
        schoolClass: true,
        progressLogs: { take: 5, orderBy: { recordedAt: "desc" } },
      },
    }),
  ]);

  const recentActivity = recentLogs
    .map(
      (l) =>
        `${l.student.name} (${l.student.schoolClass?.name ?? "No class"}): ${l.category} ${l.score}/${l.maxScore}`
    )
    .join("; ");

  const studentSummary = allStudents
    .map((s) => {
      const avg =
        s.progressLogs.length > 0
          ? (
              s.progressLogs.reduce(
                (sum, l) => sum + (l.score / l.maxScore) * 100,
                0
              ) / s.progressLogs.length
            ).toFixed(0)
          : "N/A";
      return `${s.name} (${s.schoolClass?.name ?? "No class"}): ${avg}% avg`;
    })
    .join("\n");

  const languageInstruction = getLanguageInstruction(locale);
  const professorName = session.user?.name ?? "Professor";

  const systemPrompt = `You are an AI assistant for a Physical Education professor named ${professorName}. ${languageInstruction}

You have access to real-time class data:
- Total students: ${studentCount}
- Recent activity: ${recentActivity || "none"}
- Student overview:
${studentSummary}

Answer questions about student performance, generate reports, write parent emails, and suggest training plans.
Be concise, helpful, and professional. If asked for a list, use bullet points. Use markdown when helpful.`;

  const history: ChatMessage[] = Array.isArray(messages) ? messages : [];

  const response = await claude.messages.create({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: question },
    ],
  });

  const reply =
    response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ reply });
}
