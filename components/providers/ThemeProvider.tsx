"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  return <>{children}</>;
}

export function ThemeToggle() {
  const t = useTranslations("common");

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
      aria-label={t("theme")}
    >
      {t("theme")}
    </button>
  );
}
