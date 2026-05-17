import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/types";

export async function getLeaderboard(
  category?: string
): Promise<LeaderboardEntry[]> {
  const where =
    category && category !== "ALL"
      ? { category: category as Category }
      : {};

  const students = await prisma.student.findMany({
    include: {
      schoolClass: true,
      progressLogs: {
        where,
        select: {
          score: true,
          maxScore: true,
          category: true,
          recordedAt: true,
        },
        orderBy: { recordedAt: "desc" },
      },
    },
  });

  const entries: Omit<LeaderboardEntry, "rank">[] = [];

  for (const student of students) {
    const logs = student.progressLogs;
    if (logs.length === 0) continue;

    const avgScore =
      logs.reduce((sum, l) => sum + (l.score / l.maxScore) * 100, 0) / logs.length;

    const recent = logs.slice(0, 3);
    const previous = logs.slice(3, 6);
    const recentAvg = recent.reduce((s, l) => s + l.score, 0) / recent.length;
    const prevAvg = previous.length
      ? previous.reduce((s, l) => s + l.score, 0) / previous.length
      : recentAvg;

    const trend: "up" | "down" | "stable" =
      recentAvg > prevAvg + 2
        ? "up"
        : recentAvg < prevAvg - 2
          ? "down"
          : "stable";

    entries.push({
      id: student.id,
      name: student.name,
      studentCode: student.studentCode,
      className: student.schoolClass?.name ?? "—",
      avatarUrl: student.avatarUrl,
      avgScore: Math.round(avgScore * 10) / 10,
      totalLogs: logs.length,
      trend,
      lastActivity: logs[0]?.recordedAt,
    });
  }

  return entries
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
