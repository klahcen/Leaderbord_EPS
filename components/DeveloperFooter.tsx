"use client";

import { useTranslations } from "next-intl";
import { DeveloperLinks } from "@/components/DeveloperLinks";

export function DeveloperFooter() {
  const t = useTranslations("common");

  return (
    <footer className="developer-footer hidden md:flex" aria-label={t("developedBy")}>
      <DeveloperLinks />
    </footer>
  );
}
