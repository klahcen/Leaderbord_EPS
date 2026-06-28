"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ClassOption } from "@/types";

interface StudentsFilterProps {
  classes: ClassOption[];
  current: {
    search?: string;
    classId?: string;
    gender?: string;
  };
}

export function StudentsFilter({ classes, current }: StudentsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("students");
  const [search, setSearch] = useState(current.search ?? "");
  const [isPending, startTransition] = useTransition();

  function applyFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    startTransition(() => {
      router.push(`/dashboard/students?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex flex-wrap gap-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}
    >
      <Input
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyFilters({ search });
        }}
        className="w-full sm:max-w-xs"
      />
      <Select
        value={current.classId ?? "all"}
        onValueChange={(v) => applyFilters({ classId: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder={t("class")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allClasses")}</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={current.gender ?? "all"}
        onValueChange={(v) => applyFilters({ gender: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t("gender")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allGenders")}</SelectItem>
          <SelectItem value="MALE">{t("male")}</SelectItem>
          <SelectItem value="FEMALE">{t("female")}</SelectItem>
          <SelectItem value="OTHER">{t("other")}</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-full sm:w-auto" onClick={() => applyFilters({ search })}>{t("search")}</Button>
    </div>
  );
}
