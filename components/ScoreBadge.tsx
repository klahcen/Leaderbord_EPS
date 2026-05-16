"use client";

import { useFormatter } from "next-intl";

export function ScoreBadge({ score }: { score: number }) {
  const format = useFormatter();
  return (
    <span>
      {format.number(score, { maximumFractionDigits: 1 })}%
    </span>
  );
}
