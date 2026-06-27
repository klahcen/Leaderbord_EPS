"use client";

import { useTranslations } from "next-intl";
import {
  QualitativeGradeDisplay,
  QualitativeGradeLabel,
} from "@/components/QualitativeGradeDisplay";
import type { LeaderboardEntry } from "@/types";

function TrendCell({ trend }: { trend: "up" | "down" | "stable" }) {
  const t = useTranslations("leaderboard");

  if (trend === "up") {
    return <span className="trend up">↑ {t("trendUp")}</span>;
  }
  if (trend === "down") {
    return <span className="trend down">↓ {t("trendDown")}</span>;
  }
  return <span className="trend stable">→ {t("trendStable")}</span>;
}

export function LeaderboardTable({ students }: { students: LeaderboardEntry[] }) {
  const t = useTranslations("leaderboard");

  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <section className="leaderboard-table-section mb-8 hidden lg:block">
      <div className="leaderboard-table-wrap">
        <table className="data-table leaderboard-table">
          <thead>
            <tr>
              <th className="col-rank">{t("rank")}</th>
              <th className="col-student">{t("student")}</th>
              <th className="col-class">{t("class")}</th>
              <th className="col-eps">{t("eps")}</th>
              <th className="col-note">{t("score")}</th>
              <th className="col-trend">{t("trend")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="col-rank">
                  <strong>{medal(student.rank) ?? `#${student.rank}`}</strong>
                </td>
                <td className="col-student">
                  <span className="leaderboard-student-cell">
                    <span
                      className="leaderboard-student-avatar"
                      aria-hidden
                    >
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="leaderboard-student-info min-w-0">
                      <span className="leaderboard-student-name">
                        {student.name}
                      </span>
                      <span className="leaderboard-student-code">
                        {student.studentCode}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="col-class">
                  <span className="badge-neutral leaderboard-class-badge">
                    {student.className}
                  </span>
                </td>
                <td className="col-eps">
                  <QualitativeGradeLabel markOutOf20={student.avgScore} />
                </td>
                <td className="col-note">
                  <QualitativeGradeDisplay
                    markOutOf20={student.avgScore}
                    compact
                  />
                </td>
                <td className="col-trend">
                  <TrendCell trend={student.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export { TrendCell };
