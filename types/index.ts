import type {
  ActivityFamily,
  EvaluationCriteria,
  EvaluationDefinition,
  EvaluationTool,
  Gender,
  KnowledgeDomain,
  Role,
  SubActivity,
} from "@prisma/client";

export type {
  ActivityFamily,
  EvaluationCriteria,
  EvaluationDefinition,
  EvaluationTool,
  Gender,
  KnowledgeDomain,
  Role,
  SubActivity,
};

export interface ClassOption {
  id: string;
  name: string;
  code: string;
}

export interface FamilyScoreBreakdown {
  ATHLETISME: number;
  SPORTS_COLLECTIFS: number;
  GYMNASTIQUE: number;
}

export function emptyFamilyScores(): FamilyScoreBreakdown {
  return { ATHLETISME: 0, SPORTS_COLLECTIFS: 0, GYMNASTIQUE: 0 };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avatarUrl: string | null;
  /** Final mark out of 20 (Moroccan grid) */
  avgScore: number;
  familyScores: FamilyScoreBreakdown;
  totalLogs: number;
  trend: "up" | "down" | "stable";
  lastActivity: Date | undefined;
  rank: number;
}

export interface ProgressFormData {
  studentId: string;
  family: ActivityFamily;
  subActivity: SubActivity;
  knowledgeDomain: KnowledgeDomain;
  criteria: EvaluationCriteria;
  definition: EvaluationDefinition;
  tool: EvaluationTool;
  iacMax: number;
  score: number;
  semester: number;
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
