import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** @deprecated Use `claude` — kept for backwards compatibility */
export const anthropic = claude;

export const CLAUDE_MODELS = {
  SONNET: "claude-sonnet-4-6",
  HAIKU: "claude-haiku-4-5",
} as const;

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function requireClaude() {
  if (!isClaudeConfigured()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
}
