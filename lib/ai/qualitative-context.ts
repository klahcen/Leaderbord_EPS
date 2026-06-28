import {
  markOutOf20ToGradeLabel,
  scoreToGradeLabel,
} from "@/lib/utils/qualitative-grades";

export function formatMarkForAI(
  mark: number | string,
  locale: string
): string {
  if (typeof mark === "string") {
    if (mark === "no data" || mark === "N/A") return mark;
    const parsed = parseFloat(mark);
    if (Number.isNaN(parsed)) return mark;
    return markOutOf20ToGradeLabel(parsed, locale);
  }
  return markOutOf20ToGradeLabel(mark, locale);
}

export function formatScoreForAI(
  score: number,
  iacMax: number,
  locale: string
): string {
  return scoreToGradeLabel(score, iacMax, locale);
}
