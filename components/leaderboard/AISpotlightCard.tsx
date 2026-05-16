import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface AISpotlightCardProps {
  insights: string | null;
}

export async function AISpotlightCard({ insights }: AISpotlightCardProps) {
  const t = await getTranslations("leaderboard");

  if (!insights) return null;

  return (
    <section className="ai-panel">
      <span className="ai-panel-label">
        <Sparkles className="h-4 w-4" aria-hidden />
        {t("aiSpotlight")}
      </span>
      <p className="ai-panel-body">{insights}</p>
    </section>
  );
}
