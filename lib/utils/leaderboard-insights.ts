import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import type { LeaderboardEntry } from "@/types";

export async function generateLeaderboardInsights(
  topStudents: LeaderboardEntry[],
  locale = "en"
): Promise<string | null> {
  if (!isClaudeConfigured() || topStudents.length === 0) {
    return null;
  }

  const top5 = topStudents.slice(0, 5);
  const mostImproved = topStudents.filter((s) => s.trend === "up").slice(0, 3);
  const languageInstruction = getLanguageInstruction(locale);

  try {
    const message = await claude.messages.create({
      model: CLAUDE_MODELS.HAIKU,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a PE coach celebrating student achievements. ${languageInstruction}

Top 5 students this week:
${top5.map((s, i) => `${i + 1}. ${s.name} — ${s.avgScore}% avg score`).join("\n")}

Most improved (trending up):
${mostImproved.map((s) => `- ${s.name} (↑ improving)`).join("\n") || "— none this week"}

Write 2-3 short sentences. Be encouraging, specific, and celebratory. Use emojis sparingly.`,
        },
      ],
    });

    const block = message.content[0];
    return block.type === "text" ? block.text : null;
  } catch {
    return null;
  }
}
