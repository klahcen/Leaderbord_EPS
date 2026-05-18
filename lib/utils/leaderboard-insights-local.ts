import type { LeaderboardCategory } from "@/lib/constants/leaderboard-categories";
import type { LeaderboardEntry } from "@/types";

export function getLocalLeaderboardInsights(
  students: LeaderboardEntry[],
  category: LeaderboardCategory,
  locale: string
): string | null {
  if (students.length === 0) return null;

  const top3 = students.slice(0, 3);
  const improved = students.filter((s) => s.trend === "up").slice(0, 2);
  const leader = top3[0];

  const categoryLabel: Record<string, Record<LeaderboardCategory, string>> = {
    fr: {
      ALL: "toutes les activités",
      PROCEDURALE: "les connaissances procédurales",
      CONCEPTUELLE: "les connaissances conceptuelles",
      COMPORTEMENTALE: "les connaissances comportementales",
    },
    en: {
      ALL: "all activities",
      PROCEDURALE: "procedural knowledge",
      CONCEPTUELLE: "conceptual knowledge",
      COMPORTEMENTALE: "behavioral knowledge",
    },
    ar: {
      ALL: "جميع الأنشطة",
      PROCEDURALE: "المعرفة الإجرائية",
      CONCEPTUELLE: "المعرفة المفاهيمية",
      COMPORTEMENTALE: "المعرفة السلوكية",
    },
  };

  const labels = categoryLabel[locale] ?? categoryLabel.en;

  const templates: Record<string, (scope: string) => string> = {
    fr: (scope) => {
      let text = `Excellente semaine en ${scope} ! ${leader.name} mène le classement avec ${leader.avgScore}/20.`;
      if (top3[1]) {
        text += ` ${top3[1].name} (${top3[1].avgScore}/20) et ${top3[2]?.name ?? "l'équipe"} restent très proches.`;
      }
      if (improved.length > 0) {
        text += ` Félicitations à ${improved.map((s) => s.name).join(" et ")} pour leur progression.`;
      }
      return text;
    },
    ar: (scope) => {
      let text = `أسبوع رائع في ${scope}! يتصدر ${leader.name} الترتيب بـ ${leader.avgScore}/20.`;
      if (top3[1]) {
        text += ` ${top3[1].name} (${top3[1].avgScore}/20) و${top3[2]?.name ?? "الفريق"} يحافظون على مستوى ممتاز.`;
      }
      if (improved.length > 0) {
        text += ` تهانينا لـ ${improved.map((s) => s.name).join(" و")} على تقدمهم.`;
      }
      return text;
    },
    en: (scope) => {
      let text = `Great week in ${scope}! ${leader.name} leads the board at ${leader.avgScore}/20.`;
      if (top3[1]) {
        text += ` ${top3[1].name} (${top3[1].avgScore}/20) and ${top3[2]?.name ?? "the team"} keep the podium competitive.`;
      }
      if (improved.length > 0) {
        text += ` Shout-out to ${improved.map((s) => s.name).join(" and ")} for trending up.`;
      }
      return text;
    },
  };

  const fn = templates[locale] ?? templates.en;
  return fn(labels[category]);
}
