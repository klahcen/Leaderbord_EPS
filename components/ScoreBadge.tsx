"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import {
  markOutOf20ToGradeLabel,
  markOutOf20ToQualitativeGrade,
  qualitativeGradeColorClass,
} from "@/lib/utils/qualitative-grades";

export function ScoreBadge({
  markOutOf20,
  className,
}: {
  markOutOf20: number;
  className?: string;
}) {
  const locale = useLocale();
  const grade = markOutOf20ToQualitativeGrade(markOutOf20);
  const label = markOutOf20ToGradeLabel(markOutOf20, locale);

  return (
    <span className={cn("font-semibold", qualitativeGradeColorClass(grade), className)}>
      {label}
    </span>
  );
}
