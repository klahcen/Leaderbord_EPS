import type { Category, Gender, Role } from "@prisma/client";

export type { Category, Gender, Role };

export interface ClassOption {
  id: string;
  name: string;
  code: string;
}

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
  studentCode?: string;
  classId?: string | null;
  age?: number | null;
  gender?: Gender | string | null;
  avatarUrl?: string | null;
}

export interface ClassFormData {
  name: string;
  code?: string;
}
