import type Anthropic from "@anthropic-ai/sdk";

export const extractProgressTool: Anthropic.Tool = {
  name: "extract_progress_entry",
  description:
    "Extract a structured Moroccan PE procedural activity entry from a natural language description.",
  input_schema: {
    type: "object" as const,
    properties: {
      family: {
        type: "string",
        enum: ["ATHLETISME", "SPORTS_COLLECTIFS", "GYMNASTIQUE"],
        description: "Activity family from the Moroccan EPS program",
      },
      subActivity: {
        type: "string",
        enum: [
          "COURSE_VITESSE",
          "COURSE_HAIES",
          "COURSE_RELAIS",
          "COURSE_ENDURANCE",
          "SAUT_LONGUEUR",
          "SAUT_HAUTEUR",
          "TRIPLE_SAUT",
          "LANCER_POIDS",
          "LANCER_DISQUE",
          "LANCER_JAVELOT",
          "FOOTBALL",
          "BASKETBALL",
          "HANDBALL",
          "RUGBY",
          "VOLLEYBALL",
          "BADMINTON",
          "GYMNASTIQUE_SOL",
        ],
        description: "Specific sub-activity within the family",
      },
      score: {
        type: "number",
        description: "Student score from 0 to the family IAC max (14 for physical families)",
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
    required: ["family", "subActivity", "score", "notes", "confidence"],
  },
};

export interface ExtractedProgress {
  family: string;
  subActivity: string;
  score: number;
  notes: string;
  confidence: "high" | "medium" | "low";
}
