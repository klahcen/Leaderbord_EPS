"use client";

import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
interface StudentRow {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avgScore: number;
  lastActivity: Date | null;
}

export function StudentTable({ students }: { students: StudentRow[] }) {
  const t = useTranslations("students");
  const format = useFormatter();

  if (students.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">{t("noStudents")}</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">{t("name")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("code")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("class")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("avgScore")}</th>
            <th className="px-4 py-3 text-left font-medium">{t("lastActivity")}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {student.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {student.studentCode}
              </td>
              <td className="px-4 py-3">{student.className}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      className="score-bar h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(student.avgScore, 100)}%` }}
                    />
                  </div>
                  <span>
                    {format.number(student.avgScore, { maximumFractionDigits: 1 })}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {student.lastActivity
                  ? format.dateTime(new Date(student.lastActivity), {
                      dateStyle: "medium",
                    })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RecentActivityFeed({
  logs,
}: {
  logs: {
    id: string;
    studentName: string;
    category: string;
    score: number;
    maxScore: number;
    recordedAt: Date;
  }[];
}) {
  const t = useTranslations("dashboard");
  const tCat = useTranslations("categories");
  const format = useFormatter();

  if (logs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("noActivity")}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{log.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {tCat(log.category as "RUNNING")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">
              {format.number(
                Math.round((log.score / log.maxScore) * 100),
                { maximumFractionDigits: 0 }
              )}
              %
            </p>
            <p className="text-xs text-muted-foreground">
              {format.dateTime(new Date(log.recordedAt), { dateStyle: "medium" })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
