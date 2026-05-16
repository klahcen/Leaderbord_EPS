export function normalizeScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.min(100, Math.max(0, (score / maxScore) * 100));
}

export function averageNormalizedScore(
  logs: { score: number; maxScore: number }[]
): number {
  if (logs.length === 0) return 0;
  const total = logs.reduce(
    (sum, log) => sum + normalizeScore(log.score, log.maxScore),
    0
  );
  return Math.round((total / logs.length) * 10) / 10;
}

export function formatCategory(category: string): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
