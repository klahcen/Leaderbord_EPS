import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claude, CLAUDE_MODELS, isClaudeConfigured } from "@/lib/claude";
import { getLanguageInstruction } from "@/lib/claude-language";
import { extractProgressTool, type ExtractedProgress } from "@/lib/ai/tools";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isClaudeConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { description, studentAge, locale = "en" } = await req.json();
  if (!description?.trim()) {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  const languageInstruction = getLanguageInstruction(locale);

  const message = await claude.messages.create({
    model: CLAUDE_MODELS.SONNET,
    max_tokens: 512,
    tools: [extractProgressTool],
    tool_choice: { type: "tool", name: "extract_progress_entry" },
    messages: [
      {
        role: "user",
        content: `Extract a PE progress entry from this description. ${languageInstruction}
Student age: ${studentAge ?? "unknown"}

Description: "${description}"

Use the extract_progress_entry tool to return structured data. Score should be 0-100 normalized.`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json(
      { error: "Could not parse description" },
      { status: 400 }
    );
  }

  const extracted = toolUse.input as ExtractedProgress;

  return NextResponse.json({
    extracted,
    category: extracted.category,
    score: extracted.score,
    maxScore: extracted.maxScore ?? 100,
    notes: extracted.notes,
    confidence: extracted.confidence,
  });
}
