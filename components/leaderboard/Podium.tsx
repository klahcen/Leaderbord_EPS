"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const podiumStyles = [
  { order: "order-2", height: "h-32", badge: "gold" as const, medal: "🥇" },
  { order: "order-1", height: "h-24", badge: "silver" as const, medal: "🥈" },
  { order: "order-3", height: "h-20", badge: "bronze" as const, medal: "🥉" },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

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
    <div className="flex items-end justify-center gap-4 py-8">
      {ordered.map((student, i) => {
        if (!student) return <div key={i} className="w-28" />;
        const style = podiumStyles[i];
        return (
          <div
            key={student.id}
            className={`flex w-28 flex-col items-center ${style.order}`}
          >
            <span className="mb-2 text-3xl">{style.medal}</span>
            <Avatar className="mb-2 h-16 w-16 border-4 border-background shadow-lg">
              <AvatarFallback className="text-lg">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="text-center text-sm font-semibold">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.className}</p>
            <Badge variant={style.badge} className="mt-1">
              {format.number(student.avgScore, { maximumFractionDigits: 1 })}%
            </Badge>
            <TrendIcon trend={student.trend} />
            <div
              className={`mt-3 w-full rounded-t-lg bg-primary/20 ${style.height} flex items-end justify-center pb-2`}
            >
              <span className="text-2xl font-bold text-primary">
                #{student.rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
