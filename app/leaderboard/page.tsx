import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getAllLeaderboards } from "@/lib/utils/leaderboard";
import {
  parseLeaderboardCategory,
  type LeaderboardCategory,
} from "@/lib/constants/leaderboard-categories";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { LeaderboardHero } from "@/components/leaderboard/LeaderboardHero";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DeveloperLinks } from "@/components/DeveloperLinks";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/providers/ThemeProvider";

export const revalidate = 30;

const getCachedAllLeaderboards = unstable_cache(
  () => getAllLeaderboards(),
  ["leaderboard-all-categories-v2"],
  { revalidate: 30 }
);

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const t = await getTranslations("leaderboard");
  const initialCategory: LeaderboardCategory =
    parseLeaderboardCategory(category);
  const dataByCategory = await getCachedAllLeaderboards();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <DeveloperLinks className="md:hidden" />
            <Link
              href="/leaderboard"
              className="sidebar-logo shrink-0 !p-0 text-base md:text-lg"
            >
              PE <span>Sport</span>
            </Link>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("professorLogin")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto min-w-0 max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <LeaderboardHero />
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
          <LeaderboardClient
            dataByCategory={dataByCategory}
            initialCategory={initialCategory}
          />
        </Suspense>
      </div>
    </main>
  );
}
