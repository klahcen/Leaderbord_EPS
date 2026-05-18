"use client";

import { useTranslations, useFormatter } from "next-intl";
import { FAMILY_ICONS } from "@/lib/activity-config";
import type { ActivityFamily } from "@prisma/client";
import { emptyFamilyScores, type LeaderboardEntry } from "@/types";

const FAMILIES: ActivityFamily[] = [
  "ATHLETISME",
  "SPORTS_COLLECTIFS",
  "GYMNASTIQUE",
];

function scoreClass(mark: number) {
  if (mark >= 14) return "high";
  if (mark >= 10) return "medium";
  return "low";
}

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
  const tAct = useTranslations("activities");
  const format = useFormatter();

  const medal = (rank: number) =>
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <section className="mb-8 hidden overflow-x-auto md:block">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("rank")}</th>
            <th>{t("student")}</th>
            <th>{t("class")}</th>
            {FAMILIES.map((family) => (
              <th key={family} className="text-center whitespace-nowrap">
                <span title={tAct(family)}>
                  {FAMILY_ICONS[family]}{" "}
                  <span className="hidden lg:inline">
                    {t(`familyShort.${family}`)}
                  </span>
                </span>
              </th>
            ))}
            <th>{t("score")}</th>
            <th>{t("trend")}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <strong>{medal(student.rank) ?? `#${student.rank}`}</strong>
              </td>
              <td>
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold"
                    aria-hidden
                  >
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-semibold">{student.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {student.studentCode}
                    </span>
                  </span>
                </span>
              </td>
              <td>
                <span className="badge-neutral">{student.className}</span>
              </td>
              {FAMILIES.map((family) => {
                const scores = student.familyScores ?? emptyFamilyScores();
                const mark = scores[family];
                return (
                  <td key={family} className="text-center tabular-nums">
                    {mark > 0
                      ? format.number(mark, {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })
                      : "—"}
                  </td>
                );
              })}
              <td>
                <div className="score-bar">
                  <div className="score-bar-track" role="presentation">
                    <span
                      className={`score-bar-fill ${scoreClass(student.avgScore)}`}
                      style={{
                        width: `${Math.min(Math.max((student.avgScore / 20) * 100, 0), 100)}%`,
                      }}
                      title={t("scoreValue", {
                        score: format.number(student.avgScore, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }),
                      })}
                    />
                  </div>
                  <strong className="min-w-[3.5rem] shrink-0 text-right tabular-nums">
                    {t("scoreValue", {
                      score: format.number(student.avgScore, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                    })}
                  </strong>
                </div>
              </td>
              <td>
                <TrendCell trend={student.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
