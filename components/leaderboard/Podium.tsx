"use client";

import { useTranslations, useFormatter } from "next-intl";
import type { LeaderboardEntry } from "@/types";

const slots = [
  { rankClass: "second", order: "order-1" },
  { rankClass: "first", order: "order-2" },
  { rankClass: "third", order: "order-3" },
] as const;

export function Podium({ top3 }: { top3: LeaderboardEntry[] }) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  if (top3.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{t("noRankings")}</p>
    );
  }

  const ordered = [top3[1] ?? null, top3[0] ?? null, top3[2] ?? null];

  return (
    <section className="podium">
      {ordered.map((student, i) => {
        if (!student) {
          return <span key={i} className="w-[100px]" />;
        }
        const slot = slots[i];
        const initials = student.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2);

        return (
          <article
            key={student.id}
            className={`podium-item ${slot.rankClass} ${slot.order}`}
          >
            <span className={`podium-avatar ${slot.rankClass}`}>{initials}</span>
            <p className="text-center text-sm font-bold">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.className}</p>
            <span className="badge-pink">
              {format.number(student.avgScore, { maximumFractionDigits: 1 })}%
            </span>
            <span className={`podium-block ${slot.rankClass}`}>#{student.rank}</span>
          </article>
        );
      })}
    </section>
  );
}
