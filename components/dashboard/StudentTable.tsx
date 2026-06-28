"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import {
  QualitativeGradeDisplay,
  QualitativeGradeLabel,
} from "@/components/QualitativeGradeDisplay";
import { deleteStudent } from "@/lib/actions/student.actions";
import { scoreToQualitativeGrade } from "@/lib/utils/qualitative-grades";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface StudentRow {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avgScore: number;
}

function StudentCardList({
  students,
  showActions,
  onDelete,
}: {
  students: StudentRow[];
  showActions: boolean;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("students");
  const tCommon = useTranslations("common");

  return (
    <div className="student-cards space-y-3 md:hidden">
      {students.map((student) => (
        <article key={student.id} className="student-card">
          <div className="student-card-header">
            <div className="student-card-identity min-w-0">
              <Link
                href={`/dashboard/students/${student.id}`}
                className="student-card-name"
              >
                {student.name}
              </Link>
              <p className="student-card-meta">{student.studentCode}</p>
            </div>
            <span className="badge-neutral shrink-0">{student.className}</span>
          </div>
          <div className="student-card-footer">
            <div className="student-card-grade">
              <span className="student-card-grade-label">{t("avgScore")}</span>
              <QualitativeGradeLabel markOutOf20={student.avgScore} />
            </div>
            {showActions && (
              <div className="flex shrink-0 gap-1">
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
                  onClick={() => onDelete(student.id)}
                  aria-label={tCommon("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
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
      <StudentCardList
        students={students}
        showActions={showActions}
        onDelete={setDeleteId}
      />

      <div className="student-table-wrap hidden overflow-x-auto rounded-lg border md:block">
        <table className="student-table w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="col-name px-4 py-3 text-left font-medium">
                {t("name")}
              </th>
              <th className="col-code px-4 py-3 text-left font-medium">
                {t("code")}
              </th>
              <th className="col-class px-4 py-3 text-left font-medium">
                {t("class")}
              </th>
              <th className="col-score px-4 py-3 text-left font-medium">
                {t("avgScore")}
              </th>
              {showActions && (
                <th className="col-actions px-4 py-3 text-right font-medium">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b transition-colors hover:bg-muted/30"
              >
                <td className="col-name px-4 py-3">
                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {student.name}
                  </Link>
                </td>
                <td className="col-code px-4 py-3 text-muted-foreground">
                  {student.studentCode}
                </td>
                <td className="col-class px-4 py-3">
                  <span className="badge-neutral">{student.className}</span>
                </td>
                <td className="col-score px-4 py-3">
                  <QualitativeGradeDisplay
                    markOutOf20={student.avgScore}
                    compact
                  />
                </td>
                {showActions && (
                  <td className="col-actions px-4 py-3">
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
          className="activity-feed-item flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium">{log.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {tEval(`criteriaLabels.${log.criteria as "HABILETE_MOTRICE"}`)}
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="font-semibold text-primary">
              {tEval(
                `gradeLevels.${scoreToQualitativeGrade(log.score, log.iacMax)}`
              )}
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
