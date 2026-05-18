"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ActivityFamily, SubActivity } from "@prisma/client";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logProgress, updateProgress } from "@/lib/actions/progress.actions";
import {
  ACTIVITY_TREE,
  buildActivitySummary,
  findSubActivityLocation,
  getActivitiesForGroup,
  getDefaultGroupForFamily,
  getFamilies,
  getFamilyEvaluationDefaults,
  getGroupEntry,
  getGroupsForFamily,
  type ActivityGroupKey,
} from "@/lib/activity-config";
import {
  calculateLogPercent,
  scoreColorClass,
} from "@/lib/utils/moroccan-scoring";
import type { ProgressFormData } from "@/types";
import { cn } from "@/lib/utils";

interface StudentOption {
  id: string;
  name: string;
  studentCode: string;
}

interface ProgressFormProps {
  students: StudentOption[];
  initialData?: Partial<ProgressFormData> & { id?: string };
}

function SelectionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-xl border-2 px-4 py-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40",
        className
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      {children}
    </button>
  );
}

function StepLabel({
  step,
  title,
  done,
}: {
  step: number;
  title: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
          done
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <Check className="h-4 w-4" /> : step}
      </span>
      <Label className="text-base font-semibold">{title}</Label>
    </div>
  );
}

export function ProgressForm({ students, initialData }: ProgressFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("progress");
  const tAct = useTranslations("activities");
  const tEval = useTranslations("evaluation");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const initialLocation = initialData?.subActivity
    ? findSubActivityLocation(initialData.subActivity)
    : null;

  const [studentId, setStudentId] = useState(initialData?.studentId ?? "");
  const [family, setFamily] = useState<ActivityFamily | "">(
    initialData?.family ?? initialLocation?.family ?? ""
  );
  const [groupKey, setGroupKey] = useState<ActivityGroupKey | "">(
    initialLocation?.groupKey ?? ""
  );
  const [subActivity, setSubActivity] = useState<SubActivity | "">(
    initialData?.subActivity ?? ""
  );
  const [score, setScore] = useState(initialData?.score?.toString() ?? "");
  const [semester, setSemester] = useState(initialData?.semester ?? 1);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [recordedAt, setRecordedAt] = useState(
    initialData?.recordedAt
      ? new Date(initialData.recordedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const selectedStudent = students.find((s) => s.id === studentId);
  const familyDefaults = family ? getFamilyEvaluationDefaults(family) : null;
  const iacMax = familyDefaults?.iacMax ?? 0;
  const scoreNum = parseFloat(score);
  const scoreValid =
    familyDefaults != null &&
    subActivity !== "" &&
    !isNaN(scoreNum) &&
    scoreNum >= 0 &&
    scoreNum <= iacMax;
  const scorePercent = familyDefaults ? calculateLogPercent(scoreNum, iacMax) : 0;

  const summary =
    family && groupKey && subActivity
      ? buildActivitySummary(family, groupKey, subActivity)
      : null;

  function selectFamily(next: ActivityFamily) {
    const defaultGroup = getDefaultGroupForFamily(next);
    const activities = getActivitiesForGroup(next, defaultGroup);
    setFamily(next);
    setGroupKey(defaultGroup);
    setSubActivity(
      next === "GYMNASTIQUE" ? (activities[0]?.value as SubActivity) : ""
    );
    setScore("");
  }

  function selectGroup(next: ActivityGroupKey) {
    setGroupKey(next);
    setSubActivity("");
    setScore("");
  }

  function selectSubActivity(next: SubActivity) {
    setSubActivity(next);
    setScore("");
  }

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
      if (!res.ok) throw new Error(data.error ?? t("saveError"));

      const extracted = data.extracted ?? data;
      const loc = findSubActivityLocation(extracted.subActivity as SubActivity);
      if (!loc) {
        setError(t("saveError"));
        return;
      }

      setFamily(extracted.family as ActivityFamily);
      setGroupKey(loc.groupKey);
      setSubActivity(extracted.subActivity as SubActivity);
      setScore(String(extracted.score ?? ""));
      setNotes(extracted.notes ?? notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentId) {
      setError(t("selectStudentError"));
      return;
    }
    if (!family || !groupKey || !subActivity || !familyDefaults || !scoreValid) {
      setError(t("scoreError"));
      return;
    }

    const data: ProgressFormData = {
      studentId,
      family,
      subActivity,
      knowledgeDomain: familyDefaults.knowledgeDomain,
      criteria: familyDefaults.criteria,
      definition: familyDefaults.definition,
      tool: familyDefaults.tool,
      iacMax: familyDefaults.iacMax,
      score: scoreNum,
      semester,
      notes: notes || undefined,
      recordedAt: new Date(recordedAt),
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

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
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

      <section className="space-y-3">
        <StepLabel step={1} title={t("selectStudent")} done={!!studentId} />
        {studentId && selectedStudent && (
          <p className="text-sm text-muted-foreground">
            ✓ {selectedStudent.name} ({selectedStudent.studentCode})
          </p>
        )}
        {!initialData?.id && (
          <>
            <Input
              placeholder={t("selectStudentPlaceholder")}
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredStudents.map((s) => (
                <SelectionButton
                  key={s.id}
                  selected={studentId === s.id}
                  onClick={() => setStudentId(s.id)}
                  className="w-full"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {s.studentCode}
                  </span>
                </SelectionButton>
              ))}
            </div>
          </>
        )}
      </section>

      {studentId && (
        <section className="space-y-3">
          <StepLabel step={2} title={t("selectFamily")} done={!!family} />
          {family && (
            <p className="text-sm text-muted-foreground">
              {ACTIVITY_TREE[family].icon} {tAct(family)}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {getFamilies().map((f) => (
              <SelectionButton
                key={f}
                selected={family === f}
                onClick={() => selectFamily(f)}
                className="text-center"
              >
                <span className="text-2xl">{ACTIVITY_TREE[f].icon}</span>
                <span className="mt-1 block text-sm font-semibold">
                  {tAct(f)}
                </span>
              </SelectionButton>
            ))}
          </div>
        </section>
      )}

      {family && (
        <section className="space-y-3">
          <StepLabel step={3} title={t("selectGroup")} done={!!groupKey} />
          {groupKey && (
            <p className="text-sm text-muted-foreground">
              {getGroupEntry(family, groupKey).icon} {tAct(groupKey)}
            </p>
          )}
          <div
            className={cn(
              "grid gap-3",
              family === "GYMNASTIQUE" ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {(Object.keys(getGroupsForFamily(family)) as ActivityGroupKey[]).map(
              (key) => {
                const group = getGroupEntry(family, key);
                return (
                  <SelectionButton
                    key={key}
                    selected={groupKey === key}
                    onClick={() => selectGroup(key)}
                  >
                    <span className="text-xl">{group.icon}</span>
                    <span className="mt-1 block text-sm font-medium">
                      {tAct(key)}
                    </span>
                  </SelectionButton>
                );
              }
            )}
          </div>
        </section>
      )}

      {family && groupKey && (
        <section className="space-y-3">
          <StepLabel
            step={4}
            title={t("selectSubActivity")}
            done={!!subActivity}
          />
          {summary && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
              {summary}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {getActivitiesForGroup(family, groupKey).map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => selectSubActivity(a.value as SubActivity)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                  subActivity === a.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {tAct(a.value)}
              </button>
            ))}
          </div>
        </section>
      )}

      {subActivity && familyDefaults && (
        <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="badge-pink rounded-full px-3 py-1 text-xs font-semibold">
              {t("iacMaxBadge", { max: iacMax })}
            </span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs">
              {t("toolBadge")}: {familyDefaults.toolLabel}
            </span>
            <span className="rounded-full border bg-muted px-3 py-1 text-xs">
              {tEval("domain")}:{" "}
              {tEval(`domains.${familyDefaults.knowledgeDomain}`)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">{tEval("score")}</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={iacMax}
              step={0.1}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
            {score && (
              <div className="space-y-1">
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      scorePercent >= 70
                        ? "bg-green-500"
                        : scorePercent >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(scorePercent, 100)}%` }}
                  />
                </div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    scoreColorClass(scorePercent)
                  )}
                >
                  {tEval("scoreOutOf", { score: scoreNum, max: iacMax })} —{" "}
                  {scorePercent}%
                  {scoreValid ? "" : ` (${t("invalidScore")})`}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {studentId && subActivity && (
        <>
          <div className="space-y-2">
            <Label>{tEval("semester")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="semester"
                  checked={semester === 1}
                  onChange={() => setSemester(1)}
                />
                {tEval("sem1")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="semester"
                  checked={semester === 2}
                  onChange={() => setSemester(2)}
                />
                {tEval("sem2")}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordedAt">{t("recordedAt")}</Label>
            <Input
              id="recordedAt"
              type="date"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending || !scoreValid}
          className="rounded-full"
        >
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
