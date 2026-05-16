"use client";

import { useFormatter } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

function scoreClass(avg: number) {
  if (avg >= 80) return "high";
  if (avg >= 50) return "medium";
  return "low";
}

export function LeaderboardCardList({ students }: { students: LeaderboardEntry[] }) {
  const format = useFormatter();

  return (
    <div className="space-y-3 md:hidden">
      {students.map((student) => (
        <div
          key={student.id}
          className="flex items-center gap-4 rounded-lg border bg-card p-4"
        >
          <span className="text-xl font-bold text-muted-foreground">
            #{student.rank}
          </span>
          <Avatar>
            <AvatarFallback>
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.className}</p>
            <div className="score-bar-track mt-2">
              <span
                className={`score-bar-fill ${scoreClass(student.avgScore)}`}
                style={{ width: `${Math.min(Math.max(student.avgScore, 0), 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <Badge>
              {format.number(student.avgScore, { maximumFractionDigits: 1 })}%
            </Badge>
            <div className="mt-1 flex justify-end">
              {student.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
              {student.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              {student.trend === "stable" && (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
