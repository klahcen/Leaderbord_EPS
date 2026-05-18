/** Leaderboard filters by knowledge domain (Moroccan evaluation grid). */
export const LEADERBOARD_CATEGORIES = [
  "ALL",
  "PROCEDURALE",
  "CONCEPTUELLE",
  "COMPORTEMENTALE",
] as const;

export type LeaderboardCategory = (typeof LEADERBOARD_CATEGORIES)[number];

export function parseLeaderboardCategory(
  value?: string | null
): LeaderboardCategory {
  if (
    value &&
    LEADERBOARD_CATEGORIES.includes(value as LeaderboardCategory)
  ) {
    return value as LeaderboardCategory;
  }
  return "ALL";
}
