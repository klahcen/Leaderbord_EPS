export const QUALITATIVE_GRADES = [
  "TRES_FAIBLE",
  "FAIBLE",
  "MOYEN",
  "BON",
  "TRES_BON",
  "EXCELLENT",
] as const;

export type QualitativeGrade = (typeof QUALITATIVE_GRADES)[number];

const GRADE_FRACTIONS: Record<QualitativeGrade, number> = {
  TRES_FAIBLE: 1 / 6,
  FAIBLE: 2 / 6,
  MOYEN: 3 / 6,
  BON: 4 / 6,
  TRES_BON: 5 / 6,
  EXCELLENT: 1,
};

export function qualitativeGradeToScore(
  grade: QualitativeGrade,
  iacMax: number
): number {
  return Math.round(GRADE_FRACTIONS[grade] * iacMax * 10) / 10;
}

export function scoreToQualitativeGrade(
  score: number,
  iacMax: number
): QualitativeGrade {
  if (iacMax <= 0) return "MOYEN";

  let closest: QualitativeGrade = QUALITATIVE_GRADES[0];
  let minDiff = Infinity;

  for (const grade of QUALITATIVE_GRADES) {
    const diff = Math.abs(score / iacMax - GRADE_FRACTIONS[grade]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = grade;
    }
  }

  return closest;
}

export function qualitativeGradePercent(grade: QualitativeGrade): number {
  return Math.round(GRADE_FRACTIONS[grade] * 100);
}

export function qualitativeGradeColorClass(grade: QualitativeGrade): string {
  if (grade === "TRES_FAIBLE" || grade === "FAIBLE") return "text-red-600";
  if (grade === "MOYEN") return "text-yellow-600";
  return "text-green-600";
}

export function qualitativeGradeBarClass(grade: QualitativeGrade): string {
  if (grade === "TRES_FAIBLE" || grade === "FAIBLE") return "bg-red-500";
  if (grade === "MOYEN") return "bg-yellow-500";
  return "bg-green-500";
}

export function markOutOf20ToQualitativeGrade(mark: number): QualitativeGrade {
  return scoreToQualitativeGrade(mark, 20);
}

export function qualitativeGradeScoreClass(
  grade: QualitativeGrade
): "high" | "medium" | "low" {
  if (grade === "TRES_FAIBLE" || grade === "FAIBLE") return "low";
  if (grade === "MOYEN") return "medium";
  return "high";
}

const GRADE_LABELS: Record<string, Record<QualitativeGrade, string>> = {
  fr: {
    TRES_FAIBLE: "Très faible",
    FAIBLE: "Faible",
    MOYEN: "Moyen",
    BON: "Bon",
    TRES_BON: "Très bon",
    EXCELLENT: "Excellent",
  },
  en: {
    TRES_FAIBLE: "Very weak",
    FAIBLE: "Weak",
    MOYEN: "Average",
    BON: "Good",
    TRES_BON: "Very good",
    EXCELLENT: "Excellent",
  },
  ar: {
    TRES_FAIBLE: "ضعيف جداً",
    FAIBLE: "ضعيف",
    MOYEN: "متوسط",
    BON: "جيد",
    TRES_BON: "جيد جداً",
    EXCELLENT: "ممتاز",
  },
};

export function getQualitativeGradeLabel(
  grade: QualitativeGrade,
  locale: string
): string {
  const labels = GRADE_LABELS[locale] ?? GRADE_LABELS.en;
  return labels[grade];
}

export function markOutOf20ToGradeLabel(mark: number, locale: string): string {
  return getQualitativeGradeLabel(markOutOf20ToQualitativeGrade(mark), locale);
}
