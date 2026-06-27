"use client";

import { useTranslations } from "next-intl";
import {
  QualitativeGradeDisplay,
  QualitativeGradeLabel,
} from "@/components/QualitativeGradeDisplay";
import { TrendCell } from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types";

function rankLabel(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function LeaderboardCardList({ students }: { students: LeaderboardEntry[] }) {
  const t = useTranslations("leaderboard");

  return (
    <div className="leaderboard-cards space-y-3 lg:hidden">
      {students.map((student) => (
        <article key={student.id} className="leaderboard-card">
          <div className="leaderboard-card-header">
            <span className="leaderboard-card-rank">{rankLabel(student.rank)}</span>
            <span className="leaderboard-student-avatar" aria-hidden>
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="leaderboard-card-identity min-w-0">
              <p className="leaderboard-student-name">{student.name}</p>
              <p className="leaderboard-student-code">{student.studentCode}</p>
            </div>
            <span className="badge-neutral leaderboard-class-badge shrink-0">
              {student.className}
            </span>
          </div>

          <div className="leaderboard-card-metrics">
            <div className="leaderboard-card-metric">
              <span className="leaderboard-card-metric-label">{t("eps")}</span>
              <QualitativeGradeLabel markOutOf20={student.avgScore} />
            </div>
            <div className="leaderboard-card-metric leaderboard-card-metric--note">
              <span className="leaderboard-card-metric-label">{t("score")}</span>
              <QualitativeGradeDisplay markOutOf20={student.avgScore} compact />
            </div>
            <div className="leaderboard-card-metric leaderboard-card-metric--trend">
              <span className="leaderboard-card-metric-label">{t("trend")}</span>
              <TrendCell trend={student.trend} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
