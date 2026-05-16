"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Category } from "@prisma/client";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logProgress, updateProgress } from "@/lib/actions/progress.actions";
import type { ProgressFormData } from "@/types";

interface StudentOption {
  id: string;
  name: string;
  studentCode: string;
}

interface ProgressFormProps {
  students: StudentOption[];
  initialData?: Partial<ProgressFormData> & { id?: string };
}

const categories = Object.values(Category);

export function ProgressForm({ students, initialData }: ProgressFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("progress");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    studentId: initialData?.studentId ?? "",
    category: initialData?.category ?? Category.RUNNING,
    score: initialData?.score?.toString() ?? "",
    maxScore: initialData?.maxScore?.toString() ?? "100",
    notes: initialData?.notes ?? "",
    recordedAt: initialData?.recordedAt
      ? new Date(initialData.recordedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  const scoreNum = parseFloat(form.score);
  const scoreValid =
    !isNaN(scoreNum) &&
    scoreNum >= 0 &&
    scoreNum <= parseFloat(form.maxScore || "100");

  async function handleAiParse() {
    if (!aiDescription.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/parse-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const extracted = data.extracted ?? data;
      setForm((f) => ({
        ...f,
        category: (extracted.category ?? f.category) as Category,
        score: String(extracted.score ?? f.score),
        maxScore: String(extracted.maxScore ?? 100),
        notes: extracted.notes ?? f.notes,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.studentId) {
      setError(t("selectStudentError"));
      return;
    }
    if (!scoreValid) {
      setError(t("scoreError"));
      return;
    }

    const data: ProgressFormData = {
      studentId: form.studentId,
      category: form.category,
      score: scoreNum,
      maxScore: parseFloat(form.maxScore) || 100,
      notes: form.notes || undefined,
      recordedAt: new Date(form.recordedAt),
    };

    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateProgress(initialData.id, data);
          router.push(`/dashboard/students/${data.studentId}`);
        } else {
          await logProgress(data);
          router.push("/dashboard");
        }
        router.refresh();
      } catch {
        setError(t("saveError"));
      }
    });
  }

  const normalizedPercent = Math.round(
    (scoreNum / parseFloat(form.maxScore || "100")) * 100
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <Label>{t("aiAutoFill")}</Label>
        <textarea
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder={t("aiPlaceholder")}
          value={aiDescription}
          onChange={(e) => setAiDescription(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAiParse}
          disabled={aiLoading || !aiDescription.trim()}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {aiLoading ? t("aiParsing") : t("aiAutoFill")}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student">{t("selectStudent")}</Label>
        <Select
          value={form.studentId}
          onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
          disabled={!!initialData?.id}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectStudentPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.studentCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t("category")}</Label>
        <Select
          value={form.category}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, category: v as Category }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {tCat(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="score">{t("score")}</Label>
          <Input
            id="score"
            type="number"
            min={0}
            max={form.maxScore}
            step={0.1}
            value={form.score}
            onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
            required
          />
          {form.score && (
            <p
              className={`text-xs ${scoreValid ? "text-green-600" : "text-red-600"}`}
            >
              {scoreValid
                ? t("normalized", { percent: normalizedPercent })
                : t("invalidScore")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxScore">{t("maxScore")}</Label>
          <Input
            id="maxScore"
            type="number"
            min={1}
            value={form.maxScore}
            onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recordedAt">{t("recordedAt")}</Label>
        <Input
          id="recordedAt"
          type="date"
          value={form.recordedAt}
          onChange={(e) => setForm((f) => ({ ...f, recordedAt: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !scoreValid}>
          {isPending
            ? t("saving")
            : initialData?.id
              ? t("update")
              : t("submit")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
