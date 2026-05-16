import { auth } from "@/lib/auth";
import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (!isClaudeConfigured()) {
    return new Response("ANTHROPIC_API_KEY is not configured", { status: 503 });
  }

  let locale = "en";
  try {
    const body = await req.json();
    locale = body.locale ?? "en";
  } catch {
    // empty body is fine
  }

  const students = await prisma.student.findMany({
    include: {
      progressLogs: {
        orderBy: { recordedAt: "desc" },
        take: 10,
      },
    },
  });

  const classSummary = students
    .map((s) => {
      const avg = s.progressLogs.length
        ? (
            s.progressLogs.reduce(
              (sum, l) => sum + (l.score / l.maxScore) * 100,
              0
            ) / s.progressLogs.length
          ).toFixed(1)
        : "no data";
      return `- ${s.name} (${s.className}): avg score ${avg}%, ${s.progressLogs.length} recent logs`;
    })
    .join("\n");

  const languageInstruction = getLanguageInstruction(locale);

  const stream = claude.messages.stream({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `You are a Physical Education department coordinator. ${languageInstruction}

Here is this week's class progress data:

${classSummary}

Generate a structured **Weekly Class Performance Report** with:
1. **Executive Summary** — overall class health in 2-3 sentences
2. **Top Performers** — name the top 3 students and why they stand out
3. **Students Needing Attention** — identify students at risk and suggest interventions
4. **Class-Wide Trends** — patterns across all students
5. **Recommended Focus for Next Week** — 2-3 class-wide training priorities
6. **Action Items** — bullet list of concrete steps for the professor

Format using markdown headers and bullet points.`,
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode(
            `\n\nError: ${err instanceof Error ? err.message : "Stream failed"}`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
