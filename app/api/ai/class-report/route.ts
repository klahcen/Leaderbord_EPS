import { auth } from "@/lib/auth";
import {
  streamText,
  formatGeminiError,
  isGeminiConfigured,
} from "@/lib/gemini";
import { getLanguageInstruction } from "@/lib/claude-language";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  if (!isGeminiConfigured()) {
    return new Response("GEMINI_API_KEY is not configured", { status: 503 });
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
      schoolClass: true,
      progressLogs: {
        orderBy: { recordedAt: "desc" },
        take: 10,
      },
    },
  });

  const classSummary = students
    .map((s) => {
      const totalScore = s.progressLogs.reduce((sum, l) => sum + l.score, 0);
      const totalMax = s.progressLogs.reduce((sum, l) => sum + l.iacMax, 0);
      const avg =
        totalMax > 0
          ? ((totalScore / totalMax) * 20).toFixed(2)
          : "no data";
      return `- ${s.name} (${s.schoolClass?.name ?? "No class"}): mark ${avg}/20, ${s.progressLogs.length} recent logs`;
    })
    .join("\n");

  const languageInstruction = getLanguageInstruction(locale);

  const prompt = `You are a Physical Education department coordinator. ${languageInstruction}

Here is this week's class progress data:

${classSummary}

Generate a structured **Weekly Class Performance Report** with:
1. **Executive Summary** — overall class health in 2-3 sentences
2. **Top Performers** — name the top 3 students and why they stand out
3. **Students Needing Attention** — identify students at risk and suggest interventions
4. **Class-Wide Trends** — patterns across all students
5. **Recommended Focus for Next Week** — 2-3 class-wide training priorities
6. **Action Items** — bullet list of concrete steps for the professor

Format using markdown headers and bullet points.`;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of streamText({
          prompt,
          maxOutputTokens: 1500,
        })) {
          controller.enqueue(new TextEncoder().encode(text));
        }
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode(
            `\n\n${formatGeminiError(err, locale)}`
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
