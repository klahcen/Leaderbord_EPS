"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { deleteStudent } from "@/lib/actions/student.actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface StudentRow {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avgScore: number;
}

export function StudentTable({
  students,
  showActions = false,
}: {
  students: StudentRow[];
  showActions?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("students");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteStudent(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  if (students.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">{t("noStudents")}</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">{t("name")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("code")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("class")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("avgScore")}</th>
              {showActions && (
                <th className="px-4 py-3 text-right font-medium">{t("actions")}</th>
              )}
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
                    <div className="score-bar-track w-24">
                      <span
                        className={`score-bar-fill ${student.avgScore >= 14 ? "high" : student.avgScore >= 10 ? "medium" : "low"}`}
                        style={{
                          width: `${Math.min(Math.max((student.avgScore / 20) * 100, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span>
                      {format.number(student.avgScore, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /20
                    </span>
                  </div>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/dashboard/students/${student.id}/edit`}
                        className="btn btn-ghost p-2"
                        aria-label={tCommon("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost p-2 text-destructive"
                        onClick={() => setDeleteId(student.id)}
                        aria-label={tCommon("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteId}
        title={t("deleteConfirm")}
        message={t("deleteConfirmMessage")}
        confirmLabel={tCommon("delete")}
        loading={isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export function RecentActivityFeed({
  logs,
}: {
  logs: {
    id: string;
    studentName: string;
    criteria: string;
    score: number;
    iacMax: number;
    recordedAt: Date;
  }[];
}) {
  const t = useTranslations("dashboard");
  const tEval = useTranslations("evaluation");
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
              {tEval(`criteriaLabels.${log.criteria as "HABILETE_MOTRICE"}`)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">
              {tEval("scoreOutOf", { score: log.score, max: log.iacMax })}
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
