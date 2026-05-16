import type { Category, Gender, Role } from "@prisma/client";

export type { Category, Gender, Role };

export interface LeaderboardEntry {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avatarUrl: string | null;
  avgScore: number;
  totalLogs: number;
  trend: "up" | "down" | "stable";
  lastActivity: Date | undefined;
  rank: number;
}

export interface ProgressFormData {
  studentId: string;
  category: Category;
  score: number;
  maxScore?: number;
  notes?: string;
  recordedAt?: Date;
}

export interface StudentFormData {
  name: string;
  studentCode: string;
  className: string;
  age?: number;
  gender?: Gender;
  avatarUrl?: string;
}
