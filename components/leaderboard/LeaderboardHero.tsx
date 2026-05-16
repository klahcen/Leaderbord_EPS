import { getTranslations } from "next-intl/server";

export async function LeaderboardHero() {
  const t = await getTranslations("leaderboard");

  return (
    <section className="leaderboard-hero" aria-labelledby="leaderboard-hero-title">
      <h1 id="leaderboard-hero-title">
        {t("heroTitle")}{" "}
        <span className="text-primary">{t("heroHighlight")}</span>
      </h1>
      <p>{t("heroSubtitle")}</p>
    </section>
  );
}
