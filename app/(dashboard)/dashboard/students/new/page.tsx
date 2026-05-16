"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/dashboard/Header";
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
import { Card, CardContent } from "@/components/ui/card";
import { createStudent } from "@/lib/actions/student.actions";

export default function NewStudentPage() {
  const router = useRouter();
  const t = useTranslations("students");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    studentCode: "",
    className: "",
    age: "",
    gender: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createStudent({
          name: form.name,
          studentCode: form.studentCode,
          className: form.className,
          age: form.age ? parseInt(form.age, 10) : undefined,
          gender:
            form.gender && form.gender !== "none"
              ? (form.gender as "MALE" | "FEMALE")
              : undefined,
        });
        router.push("/dashboard/students");
        router.refresh();
      } catch {
        setError(t("createError"));
      }
    });
  }

  return (
    <div>
      <Header title={t("addTitle")} description={t("addDescription")} />
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentCode">{t("studentCode")}</Label>
              <Input
                id="studentCode"
                value={form.studentCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentCode: e.target.value }))
                }
                placeholder={t("studentCodePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="className">{t("class")}</Label>
              <Input
                id="className"
                value={form.className}
                onChange={(e) =>
                  setForm((f) => ({ ...f, className: e.target.value }))
                }
                placeholder={t("classPlaceholder")}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">{t("age")}</Label>
                <Input
                  id="age"
                  type="number"
                  min={5}
                  max={25}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("gender")}</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("genderSelect")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("genderNone")}</SelectItem>
                    <SelectItem value="MALE">{t("male")}</SelectItem>
                    <SelectItem value="FEMALE">{t("female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? t("creating") : t("createStudent")}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {tCommon("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
