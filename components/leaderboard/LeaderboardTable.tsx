"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  const t = useTranslations("leaderboard");

  if (trend === "up")
    return (
      <span className="inline-flex items-center gap-1 text-green-600">
        <TrendingUp className="h-3 w-3" /> {t("trendUp")}
      </span>
    );
  if (trend === "down")
    return (
      <span className="inline-flex items-center gap-1 text-red-600">
        <TrendingDown className="h-3 w-3" /> {t("trendDown")}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-gray-400">
      <Minus className="h-3 w-3" /> {t("trendStable")}
    </span>
  );
}

export function LeaderboardTable({ students }: { students: LeaderboardEntry[] }) {
  const t = useTranslations("leaderboard");
  const format = useFormatter();

  return (
    <div className="mb-8 hidden overflow-x-auto rounded-lg border md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">{t("rank")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("student")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("class")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("score")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("trend")}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 font-bold">#{student.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.studentCode}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{student.className}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="score-bar h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(student.avgScore, 100)}%` }}
                    />
                  </div>
                  <span className="font-semibold">
                    {format.number(student.avgScore, { maximumFractionDigits: 1 })}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <TrendBadge trend={student.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
