"use client";

import { useFormatter } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

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
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="score-bar h-full rounded-full bg-primary"
                style={{ width: `${Math.min(student.avgScore, 100)}%` }}
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
