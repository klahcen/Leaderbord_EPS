import { TOTAL_IAC_MAX } from "@/lib/evaluation-grid";

export function calculateMarkOutOf20(
  totalScore: number,
  totalMax: number = TOTAL_IAC_MAX
): number {
  if (totalMax <= 0) return 0;
  return Math.round((totalScore / totalMax) * 20 * 100) / 100;
}

export function calculateLogPercent(score: number, iacMax: number): number {
  if (iacMax <= 0) return 0;
  return Math.round((score / iacMax) * 100);
}

export function scoreColorClass(percent: number): string {
  if (percent >= 70) return "text-green-600";
  if (percent >= 50) return "text-yellow-600";
  return "text-red-600";
}

export { TOTAL_IAC_MAX };
