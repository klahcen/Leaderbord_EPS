"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();

  function handleChange(newLocale: string) {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <div
      className={cn("flex items-center gap-1 rounded-lg border bg-card p-1", className)}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => handleChange(lang.code)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            locale === lang.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label={`Switch to ${lang.label}`}
          aria-pressed={locale === lang.code}
        >
          <span aria-hidden>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
