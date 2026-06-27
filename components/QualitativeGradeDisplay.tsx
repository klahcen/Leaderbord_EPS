"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  markOutOf20ToQualitativeGrade,
  qualitativeGradeColorClass,
  qualitativeGradePercent,
  qualitativeGradeScoreClass,
} from "@/lib/utils/qualitative-grades";

type QualitativeGradeDisplayProps = {
  markOutOf20: number;
  showBar?: boolean;
  compact?: boolean;
  labelClassName?: string;
};

export function QualitativeGradeLabel({
  markOutOf20,
  className,
}: {
  markOutOf20: number;
  className?: string;
}) {
  const tEval = useTranslations("evaluation");
  const grade = markOutOf20ToQualitativeGrade(markOutOf20);
  const label = tEval(`gradeLevels.${grade}`);

  return (
    <span
      className={cn(
        "text-xs font-semibold whitespace-nowrap",
        qualitativeGradeColorClass(grade),
        className
      )}
      title={label}
    >
      {label}
    </span>
  );
}

export function QualitativeGradeDisplay({
  markOutOf20,
  showBar = true,
  compact = false,
  labelClassName,
}: QualitativeGradeDisplayProps) {
  const tEval = useTranslations("evaluation");
  const grade = markOutOf20ToQualitativeGrade(markOutOf20);
  const label = tEval(`gradeLevels.${grade}`);
  const percent = qualitativeGradePercent(grade);
  const scoreClass = qualitativeGradeScoreClass(grade);

  if (!showBar) {
    return (
      <span
        className={cn(
          compact ? "text-xs font-semibold" : "font-semibold",
          qualitativeGradeColorClass(grade),
          labelClassName
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <div className={cn("score-bar", compact && "score-bar--compact gap-1.5")}>
      <div
        className={cn("score-bar-track", compact && "score-bar-track--compact")}
        role="presentation"
      >
        <span
          className={`score-bar-fill ${scoreClass}`}
          style={{ width: `${percent}%` }}
          title={label}
        />
      </div>
      <strong
        className={cn(
          "shrink-0 text-right",
          compact ? "min-w-[3.25rem] text-[10px] font-semibold leading-tight" : "min-w-[5.5rem]",
          qualitativeGradeColorClass(grade),
          labelClassName
        )}
      >
        {label}
      </strong>
    </div>
  );
}
