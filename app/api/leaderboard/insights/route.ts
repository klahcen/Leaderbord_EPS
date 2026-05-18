import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getLocale } from "next-intl/server";
import { parseLeaderboardCategory } from "@/lib/constants/leaderboard-categories";
import { getAllLeaderboards } from "@/lib/utils/leaderboard";
import { generateLeaderboardInsights } from "@/lib/utils/leaderboard-insights";

/** Optional AI-enhanced insights (not used on every tab click). */
export async function GET(request: NextRequest) {
  const category = parseLeaderboardCategory(
    request.nextUrl.searchParams.get("category")
  );
  const locale =
    request.nextUrl.searchParams.get("locale") ?? (await getLocale());

  const insights = await unstable_cache(
    async () => {
      const data = await getAllLeaderboards();
      return generateLeaderboardInsights(data[category] ?? [], locale);
    },
    [`leaderboard-ai-insights-${category}-${locale}`],
    { revalidate: 3600 }
  )();

  return NextResponse.json({ insights });
}
