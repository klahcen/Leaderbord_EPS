"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/types";
import {
  parseLeaderboardCategory,
  type LeaderboardCategory,
} from "@/lib/constants/leaderboard-categories";
import { CategoryFilterClient } from "@/components/leaderboard/CategoryFilterClient";
import { AISpotlightClient } from "@/components/leaderboard/AISpotlightClient";
import { Podium } from "@/components/leaderboard/Podium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardCardList } from "@/components/leaderboard/LeaderboardCard";

interface LeaderboardClientProps {
  dataByCategory: Record<LeaderboardCategory, LeaderboardEntry[]>;
  initialCategory: LeaderboardCategory;
}

function categoryUrl(category: LeaderboardCategory) {
  return category === "ALL" ? "/leaderboard" : `/leaderboard?category=${category}`;
}

export function LeaderboardClient({
  dataByCategory,
  initialCategory,
}: LeaderboardClientProps) {
  const [category, setCategory] = useState<LeaderboardCategory>(initialCategory);
  const students = dataByCategory[category] ?? [];

  const handleCategoryChange = useCallback((next: LeaderboardCategory) => {
    setCategory(next);
    window.history.replaceState(null, "", categoryUrl(next));
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCategory(parseLeaderboardCategory(params.get("category")));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <>
      <CategoryFilterClient active={category} onChange={handleCategoryChange} />
      <section className="leaderboard-spotlight-row">
        <AISpotlightClient category={category} students={students} />
        <div className="leaderboard-podium-wrap">
          <Podium top3={students.slice(0, 3)} />
        </div>
      </section>
      <LeaderboardTable students={students} />
      <LeaderboardCardList students={students} />
    </>
  );
}
