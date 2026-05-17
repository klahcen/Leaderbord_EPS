import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { getLeaderboard } from "@/lib/utils/leaderboard";
import { generateLeaderboardInsights } from "@/lib/utils/leaderboard-insights";
import { CategoryFilter } from "@/components/leaderboard/CategoryFilter";
import { Podium } from "@/components/leaderboard/Podium";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { LeaderboardCardList } from "@/components/leaderboard/LeaderboardCard";
import { AISpotlightCard } from "@/components/leaderboard/AISpotlightCard";
import { LeaderboardHero } from "@/components/leaderboard/LeaderboardHero";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/providers/ThemeProvider";

export const revalidate = 30;

async function getInsights(category: string, locale: string) {
  return unstable_cache(
    async () => {
      const students = await getLeaderboard(category);
      return generateLeaderboardInsights(students, locale);
    },
    [`leaderboard-insights-${category}-${locale}`],
    { revalidate: 3600 }
  )();
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const locale = await getLocale();
  const t = await getTranslations("leaderboard");
  const category = searchParams.category ?? "ALL";

  const [students, insights] = await Promise.all([
    getLeaderboard(category),
    getInsights(category, locale),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/leaderboard" className="sidebar-logo !p-0 text-base md:text-lg">
            PE <span>Sport</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("professorLogin")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <LeaderboardHero />
        <CategoryFilter active={category} />
        <section
          className={`leaderboard-spotlight-row${insights ? "" : " leaderboard-spotlight-row--solo"}`}
        >
          {insights ? <AISpotlightCard insights={insights} /> : null}
          <div className="leaderboard-podium-wrap">
            <Podium top3={students.slice(0, 3)} />
          </div>
        </section>
        <LeaderboardTable students={students} />
        <LeaderboardCardList students={students} />
      </div>
    </main>
  );
}
