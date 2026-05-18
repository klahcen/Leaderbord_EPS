import { prisma } from "@/lib/prisma";
import {
  LEADERBOARD_CATEGORIES,
  type LeaderboardCategory,
} from "@/lib/constants/leaderboard-categories";
import { calculateMarkOutOf20 } from "@/lib/utils/moroccan-scoring";
import {
  emptyFamilyScores,
  type FamilyScoreBreakdown,
  type LeaderboardEntry,
} from "@/types";
import type { ActivityFamily, KnowledgeDomain } from "@prisma/client";

export type { LeaderboardCategory };
export { LEADERBOARD_CATEGORIES };

const FAMILIES: ActivityFamily[] = [
  "ATHLETISME",
  "SPORTS_COLLECTIFS",
  "GYMNASTIQUE",
];

function withFamilyScores(entry: LeaderboardEntry): LeaderboardEntry {
  return {
    ...entry,
    familyScores: entry.familyScores ?? emptyFamilyScores(),
  };
}

type StudentWithLogs = Awaited<ReturnType<typeof fetchStudentsWithLogs>>[number];

async function fetchStudentsWithLogs() {
  return prisma.student.findMany({
    include: {
      schoolClass: true,
      progressLogs: {
        select: {
          score: true,
          iacMax: true,
          knowledgeDomain: true,
          family: true,
          recordedAt: true,
        },
        orderBy: { recordedAt: "desc" },
      },
    },
  });
}

function computeFamilyScores(
  logs: StudentWithLogs["progressLogs"]
): FamilyScoreBreakdown {
  const result: FamilyScoreBreakdown = {
    ATHLETISME: 0,
    SPORTS_COLLECTIFS: 0,
    GYMNASTIQUE: 0,
  };

  for (const family of FAMILIES) {
    const familyLogs = logs.filter((l) => l.family === family);
    if (familyLogs.length === 0) continue;
    const totalScore = familyLogs.reduce((s, l) => s + l.score, 0);
    const totalMax = familyLogs.reduce((s, l) => s + l.iacMax, 0);
    result[family] = calculateMarkOutOf20(totalScore, totalMax);
  }

  return result;
}

function buildLeaderboard(
  students: StudentWithLogs[],
  filter: string
): LeaderboardEntry[] {
  const entries: Omit<LeaderboardEntry, "rank">[] = [];

  for (const student of students) {
    const logs =
      filter && filter !== "ALL"
        ? student.progressLogs.filter(
            (l) => l.knowledgeDomain === (filter as KnowledgeDomain)
          )
        : student.progressLogs;

    if (logs.length === 0) continue;

    const totalScore = logs.reduce((sum, l) => sum + l.score, 0);
    const totalMax = logs.reduce((sum, l) => sum + l.iacMax, 0);
    const markOutOf20 = calculateMarkOutOf20(totalScore, totalMax);
    const familyScores = computeFamilyScores(logs);

    const recent = logs.slice(0, 3);
    const previous = logs.slice(3, 6);
    const recentMark =
      recent.length > 0
        ? calculateMarkOutOf20(
            recent.reduce((s, l) => s + l.score, 0),
            recent.reduce((s, l) => s + l.iacMax, 0)
          )
        : 0;
    const prevMark =
      previous.length > 0
        ? calculateMarkOutOf20(
            previous.reduce((s, l) => s + l.score, 0),
            previous.reduce((s, l) => s + l.iacMax, 0)
          )
        : recentMark;

    const trend: "up" | "down" | "stable" =
      recentMark > prevMark + 0.5
        ? "up"
        : recentMark < prevMark - 0.5
          ? "down"
          : "stable";

    entries.push({
      id: student.id,
      name: student.name,
      studentCode: student.studentCode,
      className: student.schoolClass?.name ?? "—",
      avatarUrl: student.avatarUrl,
      avgScore: markOutOf20,
      familyScores,
      totalLogs: logs.length,
      trend,
      lastActivity: logs[0]?.recordedAt,
    });
  }

  return entries
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((entry, index) =>
      withFamilyScores({ ...entry, rank: index + 1 })
    );
}

export async function getLeaderboard(
  filter?: string
): Promise<LeaderboardEntry[]> {
  const students = await fetchStudentsWithLogs();
  return buildLeaderboard(students, filter ?? "ALL");
}

export async function getAllLeaderboards(): Promise<
  Record<LeaderboardCategory, LeaderboardEntry[]>
> {
  const students = await fetchStudentsWithLogs();
  const result = {} as Record<LeaderboardCategory, LeaderboardEntry[]>;

  for (const category of LEADERBOARD_CATEGORIES) {
    result[category] = buildLeaderboard(students, category);
  }

  return result;
}
