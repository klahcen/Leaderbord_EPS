"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createClass,
  updateClass,
  deleteClass,
  getClassStudentCount,
  type DeleteClassMode,
} from "@/lib/actions/class.actions";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { ClassOption } from "@/types";

interface ClassListProps {
  classes: ClassOption[];
}

export default function ClassList({ classes: initial }: ClassListProps) {
  const router = useRouter();
  const t = useTranslations("classes");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [deleteTarget, setDeleteTarget] = useState<ClassOption | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [deleteMode, setDeleteMode] = useState<DeleteClassMode>("setNull");

  function resetForm() {
    setForm({ name: "", code: "" });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  function startEdit(cls: ClassOption) {
    setEditingId(cls.id);
    setForm({ name: cls.name, code: cls.code });
    setShowForm(true);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (editingId) {
          await updateClass(editingId, form);
        } else {
          await createClass(form);
        }
        resetForm();
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(msg === "CODE_EXISTS" ? t("codeExists") : t("saveError"));
      }
    });
  }

  async function openDelete(cls: ClassOption) {
    setDeleteTarget(cls);
    setDeleteMode("setNull");
    try {
      const count = await getClassStudentCount(cls.id);
      setStudentCount(count);
    } catch {
      setStudentCount(0);
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteClass(deleteTarget.id, deleteMode);
        setDeleteTarget(null);
        router.refresh();
      } catch {
        setError(t("deleteError"));
        setDeleteTarget(null);
      }
    });
  }

  return (
    <section className="card mb-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{t("title")}</h2>
        {!showForm && (
          <button
            type="button"
            className="btn btn-outline-pink"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("addClass")}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-lg border p-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              {t("name")}
            </label>
            <input
              className="input-lemonade"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              {t("code")}
            </label>
            <input
              className="input-lemonade"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder={t("codeOptional")}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? tCommon("loading") : editingId ? tCommon("save") : t("addClass")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      )}

      {initial.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noClasses")}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {initial.map((cls) => (
            <li
              key={cls.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{cls.code}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn btn-ghost p-2"
                  onClick={() => startEdit(cls)}
                  aria-label={tCommon("edit")}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost p-2 text-destructive"
                  onClick={() => openDelete(cls)}
                  aria-label={tCommon("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={t("deleteConfirm")}
        message={
          studentCount > 0
            ? t("deleteWithStudents", { count: studentCount })
            : t("deleteConfirmMessage")
        }
        confirmLabel={tCommon("delete")}
        loading={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        {studentCount > 0 ? (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === "setNull"}
                onChange={() => setDeleteMode("setNull")}
              />
              {t("deleteSetNull")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === "cascade"}
                onChange={() => setDeleteMode("cascade")}
              />
              {t("deleteCascade")}
            </label>
          </div>
        ) : null}
      </ConfirmModal>
    </section>
  );
}
