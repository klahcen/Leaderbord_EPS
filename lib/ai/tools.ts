import { SchemaType, type Schema } from "@google/generative-ai";

export const extractProgressSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    family: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["ATHLETISME", "SPORTS_COLLECTIFS", "GYMNASTIQUE"],
      description: "Activity family from the Moroccan EPS program",
    },
    subActivity: {
      type: SchemaType.STRING,
      format: "enum",
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
      type: SchemaType.NUMBER,
      description: "Student score from 0 to the family IAC max (14 for physical families)",
    },
    notes: {
      type: SchemaType.STRING,
      description: "A clean, professional note summarizing the performance",
    },
    confidence: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["high", "medium", "low"],
      description: "How confident you are in this extraction",
    },
  },
  required: ["family", "subActivity", "score", "notes", "confidence"],
};

export interface ExtractedProgress {
  family: string;
  subActivity: string;
  score: number;
  notes: string;
  confidence: "high" | "medium" | "low";
}
