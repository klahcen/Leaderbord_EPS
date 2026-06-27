"use client";

import { QualitativeGradeDisplay } from "@/components/QualitativeGradeDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

export function LeaderboardCardList({ students }: { students: LeaderboardEntry[] }) {

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
            <div className="mt-2">
              <QualitativeGradeDisplay markOutOf20={student.avgScore} />
            </div>
          </div>
          <div className="text-right">
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
