import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface AISpotlightCardProps {
  insights: string | null;
}

export async function AISpotlightCard({ insights }: AISpotlightCardProps) {
  const t = await getTranslations("leaderboard");

  if (!insights) return null;

  return (
    <div className="ai-spotlight-card mb-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          {t("aiSpotlight")}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{insights}</p>
    </div>
  );
}
