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
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { calculateLogPercent } from "@/lib/utils/moroccan-scoring";

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

export function ProgressLineChart({ logs }: { logs: ProgressLog[] }) {
  const tEval = useTranslations("evaluation");
  const criteriaKeys = Array.from(new Set(logs.map((l) => l.criteria)));
  const label = (v: string) =>
    tEval(`criteriaLabels.${v as "HABILETE_MOTRICE"}`);

  const chartData = logs
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((log) => ({
      date: format(new Date(log.recordedAt), "MMM d"),
      [`${log.criteria}`]: calculateLogPercent(log.score, log.iacMax),
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis domain={[0, 100]} className="text-xs" />
        <Tooltip />
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
  const label = (v: string) => tCat(v as "PROCEDURALE");

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          tickFormatter={(v) => label(v)}
          className="text-xs"
        />
        <YAxis domain={[0, 20]} className="text-xs" />
        <Tooltip labelFormatter={(v) => label(v as string)} />
        <Bar dataKey="avgScore" fill="#01696f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
