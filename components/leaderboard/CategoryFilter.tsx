"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const categories = [
  "ALL",
  "RUNNING",
  "JUMPING",
  "SWIMMING",
  "STRENGTH",
  "FLEXIBILITY",
  "ENDURANCE",
  "COORDINATION",
  "TEAMWORK",
] as const;

export function CategoryFilter({ active }: { active: string }) {
  const pathname = usePathname();
  const t = useTranslations("categories");

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={cat === "ALL" ? pathname : `${pathname}?category=${cat}`}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            active === cat
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          {t(cat)}
        </Link>
      ))}
    </div>
  );
}
