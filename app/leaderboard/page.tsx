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
  const t = await getTranslations("leaderboard");
  const locale = await getLocale();
  const category = searchParams.category ?? "ALL";

  const [students, insights] = await Promise.all([
    getLeaderboard(category),
    getInsights(category, locale),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
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
        <CategoryFilter active={category} />
        <AISpotlightCard insights={insights} />
        <Podium top3={students.slice(0, 3)} />
        <LeaderboardTable students={students} />
        <LeaderboardCardList students={students} />
      </div>
    </main>
  );
}
