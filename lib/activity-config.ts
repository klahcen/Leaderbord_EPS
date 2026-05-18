import type {
  ActivityFamily,
  EvaluationCriteria,
  EvaluationDefinition,
  EvaluationTool,
  KnowledgeDomain,
  SubActivity,
} from "@prisma/client";

export const ACTIVITY_TREE = {
  ATHLETISME: {
    label: "Athlétisme",
    icon: "🏃",
    groups: {
      COURSES: {
        label: "Courses",
        icon: "⚡",
        activities: [
          { value: "COURSE_VITESSE", label: "Course de vitesse / Sprint" },
          { value: "COURSE_HAIES", label: "Course de haies" },
          { value: "COURSE_RELAIS", label: "Course de relais" },
          { value: "COURSE_ENDURANCE", label: "Course d'endurance / Cross" },
        ],
      },
      SAUTS: {
        label: "Sauts",
        icon: "🦘",
        activities: [
          { value: "SAUT_LONGUEUR", label: "Saut en longueur" },
          { value: "SAUT_HAUTEUR", label: "Saut en hauteur" },
          { value: "TRIPLE_SAUT", label: "Triple saut" },
        ],
      },
      LANCERS: {
        label: "Lancers",
        icon: "🥏",
        activities: [
          { value: "LANCER_POIDS", label: "Lancer de poids" },
          { value: "LANCER_DISQUE", label: "Lancer de disque" },
          { value: "LANCER_JAVELOT", label: "Lancer de javelot" },
        ],
      },
    },
  },
  SPORTS_COLLECTIFS: {
    label: "Sports Collectifs",
    icon: "⚽",
    groups: {
      MARQUAGE_DEMARQUAGE: {
        label: "Marquage - Démarquage",
        icon: "🏃‍♂️",
        activities: [
          { value: "FOOTBALL", label: "Football" },
          { value: "BASKETBALL", label: "Basketball" },
          { value: "HANDBALL", label: "Handball" },
          { value: "RUGBY", label: "Rugby" },
        ],
      },
      SPORTS_RENVOI: {
        label: "Sports de Renvoi",
        icon: "🏸",
        activities: [
          { value: "VOLLEYBALL", label: "Volleyball" },
          { value: "BADMINTON", label: "Badminton" },
        ],
      },
    },
  },
  GYMNASTIQUE: {
    label: "Gymnastique",
    icon: "🤸",
    groups: {
      SOL: {
        label: "Gymnastique au sol",
        icon: "🤸",
        activities: [
          { value: "GYMNASTIQUE_SOL", label: "Gymnastique au sol" },
        ],
      },
    },
  },
} as const;

export type ActivityGroupEntry = {
  label: string;
  icon: string;
  activities: readonly { value: string; label: string }[];
};

export type ActivityGroupKey =
  keyof (typeof ACTIVITY_TREE)[ActivityFamily]["groups"];

export const IAC_MAP: Record<string, number> = {
  ATHLETISME: 14,
  SPORTS_COLLECTIFS: 14,
  GYMNASTIQUE: 14,
  CONCEPTUELLE: 3,
  COMPORTEMENTALE: 3,
};

export const TOOL_MAP: Record<string, string> = {
  ATHLETISME: "Chronomètre / Décamètre",
  SPORTS_COLLECTIFS: "Grille d'observation",
  GYMNASTIQUE: "Grille d'observation",
  CONCEPTUELLE: "Questions et réponses orale et écrit",
  COMPORTEMENTALE: "Observation directe de l'élève",
};

const FAMILY_TOOL_ENUM: Record<ActivityFamily, EvaluationTool> = {
  ATHLETISME: "CHRONOMETRE_DECAMETRE",
  SPORTS_COLLECTIFS: "GRILLE_OBSERVATION",
  GYMNASTIQUE: "GRILLE_OBSERVATION",
};

const FAMILY_CRITERIA: Record<
  ActivityFamily,
  {
    criteria: EvaluationCriteria;
    definition: EvaluationDefinition;
  }
> = {
  ATHLETISME: {
    criteria: "COMPORTEMENT_MOTEUR",
    definition: "PERFORMANCE",
  },
  SPORTS_COLLECTIFS: {
    criteria: "CAPACITE_COLLECTIVE",
    definition: "PRODUIT_COMPORTEMENT_PHYSIQUE",
  },
  GYMNASTIQUE: {
    criteria: "CAPACITE_GYMNASTIQUE",
    definition: "PRODUIT_COMPORTEMENT_PHYSIQUE",
  },
};

const SUB_TO_FAMILY: Record<SubActivity, ActivityFamily> = {
  COURSE_VITESSE: "ATHLETISME",
  COURSE_HAIES: "ATHLETISME",
  COURSE_RELAIS: "ATHLETISME",
  COURSE_ENDURANCE: "ATHLETISME",
  SAUT_LONGUEUR: "ATHLETISME",
  SAUT_HAUTEUR: "ATHLETISME",
  TRIPLE_SAUT: "ATHLETISME",
  LANCER_POIDS: "ATHLETISME",
  LANCER_DISQUE: "ATHLETISME",
  LANCER_JAVELOT: "ATHLETISME",
  FOOTBALL: "SPORTS_COLLECTIFS",
  BASKETBALL: "SPORTS_COLLECTIFS",
  HANDBALL: "SPORTS_COLLECTIFS",
  RUGBY: "SPORTS_COLLECTIFS",
  VOLLEYBALL: "SPORTS_COLLECTIFS",
  BADMINTON: "SPORTS_COLLECTIFS",
  GYMNASTIQUE_SOL: "GYMNASTIQUE",
};

export const FAMILY_ICONS: Record<ActivityFamily, string> = {
  ATHLETISME: "🏃",
  SPORTS_COLLECTIFS: "⚽",
  GYMNASTIQUE: "🤸",
};

export const ALL_SUB_ACTIVITIES = Object.keys(SUB_TO_FAMILY) as SubActivity[];

export function getFamilies(): ActivityFamily[] {
  return Object.keys(ACTIVITY_TREE) as ActivityFamily[];
}

export function getGroupsForFamily(family: ActivityFamily) {
  return ACTIVITY_TREE[family].groups;
}

export function getDefaultGroupForFamily(family: ActivityFamily): ActivityGroupKey {
  const groups = Object.keys(ACTIVITY_TREE[family].groups) as ActivityGroupKey[];
  return groups[0];
}

export function getGroupEntry(
  family: ActivityFamily,
  groupKey: ActivityGroupKey
): ActivityGroupEntry {
  const groups = ACTIVITY_TREE[family].groups as Record<
    string,
    ActivityGroupEntry
  >;
  return groups[groupKey];
}

export function getActivitiesForGroup(
  family: ActivityFamily,
  groupKey: ActivityGroupKey
) {
  return getGroupEntry(family, groupKey).activities;
}

export function getFamilyForSubActivity(sub: SubActivity): ActivityFamily {
  return SUB_TO_FAMILY[sub];
}

export function findSubActivityLocation(sub: SubActivity): {
  family: ActivityFamily;
  groupKey: ActivityGroupKey;
} | null {
  const family = SUB_TO_FAMILY[sub];
  for (const groupKey of Object.keys(
    ACTIVITY_TREE[family].groups
  ) as ActivityGroupKey[]) {
    const group = getGroupEntry(family, groupKey);
    if (group.activities.some((a) => a.value === sub)) {
      return { family, groupKey };
    }
  }
  return null;
}

export function getFamilyEvaluationDefaults(family: ActivityFamily) {
  const { criteria, definition } = FAMILY_CRITERIA[family];
  return {
    knowledgeDomain: "PROCEDURALE" as KnowledgeDomain,
    criteria,
    definition,
    tool: FAMILY_TOOL_ENUM[family],
    iacMax: IAC_MAP[family],
    toolLabel: TOOL_MAP[family],
  };
}

export function buildActivitySummary(
  family: ActivityFamily,
  groupKey: ActivityGroupKey,
  subActivity: SubActivity
): string {
  const fam = ACTIVITY_TREE[family];
  const group = getGroupEntry(family, groupKey);
  const activity = group.activities.find((a) => a.value === subActivity);
  return `${fam.icon} ${fam.label} › ${group.label} › ${activity?.label ?? subActivity}`;
}
