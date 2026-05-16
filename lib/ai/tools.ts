import type Anthropic from "@anthropic-ai/sdk";

export const extractProgressTool: Anthropic.Tool = {
  name: "extract_progress_entry",
  description:
    "Extract a structured PE progress entry from a natural language description of a student's activity performance.",
  input_schema: {
    type: "object" as const,
    properties: {
      category: {
        type: "string",
        enum: [
          "RUNNING",
          "JUMPING",
          "SWIMMING",
          "STRENGTH",
          "FLEXIBILITY",
          "ENDURANCE",
          "COORDINATION",
          "TEAMWORK",
        ],
        description: "The PE activity category",
      },
      score: {
        type: "number",
        description:
          "Normalized score from 0 to 100. Convert raw metrics (e.g., time, distance, reps) to a 0-100 scale.",
      },
      maxScore: {
        type: "number",
        description: "Maximum possible score, default 100",
      },
      notes: {
        type: "string",
        description: "A clean, professional note summarizing the performance",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "How confident you are in this extraction",
      },
    },
    required: ["category", "score", "notes", "confidence"],
  },
};

export interface ExtractedProgress {
  category: string;
  score: number;
  maxScore?: number;
  notes: string;
  confidence: "high" | "medium" | "low";
}
