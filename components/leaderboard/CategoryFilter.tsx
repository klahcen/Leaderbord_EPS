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
    <nav className="category-tabs" aria-label="Category filter">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={cat === "ALL" ? pathname : `${pathname}?category=${cat}`}
          className={cn("category-tab", active === cat && "active")}
        >
          {t(cat)}
        </Link>
      ))}
    </nav>
  );
}
