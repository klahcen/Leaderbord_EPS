"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LEADERBOARD_CATEGORIES } from "@/lib/constants/leaderboard-categories";

export function StudentProgressFilter({
  studentId,
  active,
}: {
  studentId: string;
  active: string;
}) {
  const t = useTranslations("categories");

  return (
    <div className="flex flex-wrap gap-2">
      {LEADERBOARD_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={
            cat === "ALL"
              ? `/dashboard/students/${studentId}`
              : `/dashboard/students/${studentId}?category=${cat}`
          }
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            active === cat
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          {t(cat)}
        </Link>
      ))}
    </div>
  );
}
