"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import type { LeaderboardCategory } from "@/lib/constants/leaderboard-categories";
import { getLocalLeaderboardInsights } from "@/lib/utils/leaderboard-insights-local";
import type { LeaderboardEntry } from "@/types";

interface AISpotlightClientProps {
  category: LeaderboardCategory;
  students: LeaderboardEntry[];
}

export function AISpotlightClient({ category, students }: AISpotlightClientProps) {
  const locale = useLocale();
  const t = useTranslations("leaderboard");

  const insights = useMemo(
    () => getLocalLeaderboardInsights(students, category, locale),
    [students, category, locale]
  );

  if (!insights) return null;

  return (
    <section className="ai-panel">
      <span className="ai-panel-label">
        <Sparkles className="h-4 w-4" aria-hidden />
        {t("aiSpotlight")}
      </span>
      <p className="ai-panel-body">{insights}</p>
    </section>
  );
}
