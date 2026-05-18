"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LEADERBOARD_CATEGORIES,
  type LeaderboardCategory,
} from "@/lib/constants/leaderboard-categories";

interface CategoryFilterClientProps {
  active: LeaderboardCategory;
  onChange: (category: LeaderboardCategory) => void;
}

export function CategoryFilterClient({
  active,
  onChange,
}: CategoryFilterClientProps) {
  const t = useTranslations("categories");

  return (
    <nav className="category-tabs" aria-label="Category filter">
      {LEADERBOARD_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn("category-tab", active === cat && "active")}
        >
          {t(cat)}
        </button>
      ))}
    </nav>
  );
}
