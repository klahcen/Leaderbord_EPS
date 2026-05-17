"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/dashboard/Header";
import { updateStudent } from "@/lib/actions/student.actions";
import type { ClassOption } from "@/types";
import type { Gender } from "@prisma/client";

interface StudentData {
  id: string;
  name: string;
  studentCode: string;
  classId: string | null;
  age: number | null;
  gender: Gender | null;
  avatarUrl: string | null;
}

export function EditStudentForm({
  student,
  classes,
}: {
  student: StudentData;
  classes: ClassOption[];
}) {
  const router = useRouter();
  const t = useTranslations("students");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: student.name,
    studentCode: student.studentCode,
    classId: student.classId ?? "",
    age: student.age?.toString() ?? "",
    gender: student.gender ?? "none",
    avatarUrl: student.avatarUrl ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateStudent(student.id, {
          name: form.name,
          studentCode: form.studentCode,
          classId: form.classId || null,
          age: form.age ? parseInt(form.age, 10) : null,
          gender: form.gender && form.gender !== "none" ? form.gender : null,
          avatarUrl: form.avatarUrl || null,
        });
        router.push(`/dashboard/students/${student.id}`);
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(msg === "CODE_EXISTS" ? t("codeExists") : t("updateError"));
      }
    });
  }

  return (
    <div>
      <Header title={t("editTitle")} description={t("editDescription")} />
      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              {t("fullName")}
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
              {t("studentCode")}
            </label>
            <input
              className="input-lemonade"
              value={form.studentCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, studentCode: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              {t("class")}
            </label>
            <select
              className="input-lemonade"
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
            >
              <option value="">{t("noClass")}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                {t("age")}
              </label>
              <input
                className="input-lemonade"
                type="number"
                min={5}
                max={25}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                {t("gender")}
              </label>
              <select
                className="input-lemonade"
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              >
                <option value="none">{t("genderNone")}</option>
                <option value="MALE">{t("male")}</option>
                <option value="FEMALE">{t("female")}</option>
                <option value="OTHER">{t("other")}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
              {t("avatarUrl")}
            </label>
            <input
              className="input-lemonade"
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? t("saving") : tCommon("save")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
