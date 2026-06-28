"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  getQualitativeGradeLabel,
  markOutOf20ToGradeIndex,
  QUALITATIVE_GRADES,
  qualitativeGradeToIndex,
  scoreToQualitativeGrade,
} from "@/lib/utils/qualitative-grades";

interface ProgressLog {
  criteria: string;
  score: number;
  iacMax: number;
  recordedAt: Date | string;
}

const COLORS = [
  "#01696f",
  "#d19900",
  "#964219",
  "#7a7974",
  "#2563eb",
  "#9333ea",
  "#dc2626",
  "#16a34a",
];

const GRADE_AXIS_TICKS = [1, 2, 3, 4, 5, 6];

export function ProgressLineChart({ logs }: { logs: ProgressLog[] }) {
  const tEval = useTranslations("evaluation");
  const locale = useLocale();
  const criteriaKeys = Array.from(new Set(logs.map((l) => l.criteria)));
  const label = (v: string) =>
    tEval(`criteriaLabels.${v as "HABILETE_MOTRICE"}`);

  const chartData = logs
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((log) => ({
      date: format(new Date(log.recordedAt), "MMM d"),
      [`${log.criteria}`]: qualitativeGradeToIndex(
        scoreToQualitativeGrade(log.score, log.iacMax)
      ),
    }));

  const merged = chartData.reduce<Record<string, unknown>[]>((acc, item) => {
    const existing = acc.find((e) => e.date === item.date);
    if (existing) {
      Object.assign(existing, item);
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  const gradeLabel = (index: number) =>
    getQualitativeGradeLabel(QUALITATIVE_GRADES[index - 1], locale);

  return (
    <ResponsiveContainer width="100%" height={280} minWidth={0}>
      <LineChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis
          domain={[1, 6]}
          ticks={GRADE_AXIS_TICKS}
          tickFormatter={(v) => gradeLabel(Number(v))}
          width={72}
          className="text-[9px] sm:text-[10px]"
        />
        <Tooltip
          formatter={(value, name) => [
            gradeLabel(Number(value ?? 0)),
            label(String(name)),
          ]}
        />
        <Legend formatter={(v) => label(v as string)} />
        {criteriaKeys.map((cat, i) => (
          <Line
            key={cat}
            type="monotone"
            dataKey={cat}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
}: {
  data: { category: string; avgScore: number }[];
}) {
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const label = (v: string) => tCat(v as "PROCEDURALE");

  const chartData = data.map((item) => ({
    category: item.category,
    gradeIndex: markOutOf20ToGradeIndex(item.avgScore),
  }));

  const gradeLabel = (index: number) =>
    getQualitativeGradeLabel(QUALITATIVE_GRADES[index - 1], locale);

  return (
    <ResponsiveContainer width="100%" height={280} minWidth={0}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          tickFormatter={(v) => label(v)}
          className="text-xs"
        />
        <YAxis
          domain={[1, 6]}
          ticks={GRADE_AXIS_TICKS}
          tickFormatter={(v) => gradeLabel(Number(v))}
          width={72}
          className="text-[9px] sm:text-[10px]"
        />
        <Tooltip
          labelFormatter={(v) => label(v as string)}
          formatter={(value) => [gradeLabel(Number(value ?? 0)), ""]}
        />
        <Bar dataKey="gradeIndex" fill="#01696f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
