import type {
  ActivityFamily,
  EvaluationCriteria,
  EvaluationDefinition,
  EvaluationTool,
  KnowledgeDomain,
} from "@prisma/client";

/** Non-procedural grid rows (conceptual / behavioral). */
export type GridSupportActivity = "TOUTES_ACTIVITES";
export type GridActivity = ActivityFamily | GridSupportActivity;

export type GridCriteriaEntry = {
  criteria: EvaluationCriteria;
  label: string;
  definition: EvaluationDefinition;
  definitionLabel: string;
  tool: EvaluationTool;
  toolLabel: string;
  iacMax: number;
};

export type GridActivityEntry = {
  activity: GridActivity;
  activityLabel: string;
  criteria: GridCriteriaEntry[];
};

export type GridDomainEntry = {
  domain: KnowledgeDomain;
  domainLabel: string;
  activities: GridActivityEntry[];
};

export const EVALUATION_GRID: GridDomainEntry[] = [
  {
    domain: "PROCEDURALE",
    domainLabel: "Connaissances procédurales",
    activities: [
      {
        activity: "ATHLETISME",
        activityLabel: "Athlétisme",
        criteria: [
          {
            criteria: "HABILETE_MOTRICE",
            label: "Habileté motrice",
            definition: "PRODUIT",
            definitionLabel: "produit",
            tool: "CHRONOMETRE_DECAMETRE",
            toolLabel: "Chronomètre / Décamètre",
            iacMax: 6,
          },
          {
            criteria: "COMPORTEMENT_MOTEUR",
            label: "Comportement moteur",
            definition: "PERFORMANCE",
            definitionLabel: "performance",
            tool: "CHRONOMETRE_DECAMETRE",
            toolLabel: "Chronomètre / Décamètre",
            iacMax: 8,
          },
        ],
      },
      {
        activity: "SPORTS_COLLECTIFS",
        activityLabel: "Sports collectifs",
        criteria: [
          {
            criteria: "CAPACITE_INDIVIDUELLE",
            label: "Capacité sportive et habileté motrice — individuelles",
            definition: "PRODUIT_COMPORTEMENT_PHYSIQUE",
            definitionLabel: "Produit du comportement physique",
            tool: "GRILLE_OBSERVATION",
            toolLabel: "Grille d'observation",
            iacMax: 6,
          },
          {
            criteria: "CAPACITE_COLLECTIVE",
            label: "Capacité sportive et habileté motrice — collectives",
            definition: "PRODUIT_COMPORTEMENT_PHYSIQUE",
            definitionLabel: "Produit du comportement physique",
            tool: "GRILLE_OBSERVATION",
            toolLabel: "Grille d'observation",
            iacMax: 8,
          },
        ],
      },
      {
        activity: "GYMNASTIQUE",
        activityLabel: "Gymnastique",
        criteria: [
          {
            criteria: "CAPACITE_GYMNASTIQUE",
            label: "Capacité sportive et habileté motrice",
            definition: "PRODUIT_COMPORTEMENT_PHYSIQUE",
            definitionLabel: "Produit du comportement physique",
            tool: "GRILLE_OBSERVATION",
            toolLabel: "Grille d'observation",
            iacMax: 14,
          },
        ],
      },
    ],
  },
  {
    domain: "CONCEPTUELLE",
    domainLabel: "Connaissances conceptuelles",
    activities: [
      {
        activity: "TOUTES_ACTIVITES",
        activityLabel: "Toutes les activités support",
        criteria: [
          {
            criteria: "CONNAISSANCE_CONCEPTUELLE",
            label:
              "Concepts, règlement, connaissances scientifiques et physiologiques",
            definition: "CONNAISSANCES_CONCEPTUELLES",
            definitionLabel:
              "Connaissances conceptuelles et terminologie relatifs à l'APS",
            tool: "QUESTIONS_REPONSES",
            toolLabel: "Questions et réponses orale et écrit",
            iacMax: 3,
          },
        ],
      },
    ],
  },
  {
    domain: "COMPORTEMENTALE",
    domainLabel: "Connaissances comportementales",
    activities: [
      {
        activity: "TOUTES_ACTIVITES",
        activityLabel: "Toutes les activités support",
        criteria: [
          {
            criteria: "CONNAISSANCE_COMPORTEMENTALE",
            label:
              "Participation, comportement, autonomie, arbitrage, organisation",
            definition: "ABSENCE_TENU_ARBITRAGE",
            definitionLabel: "Absence, tenu, arbitrage, organisation, respect",
            tool: "OBSERVATION_DIRECTE",
            toolLabel: "Observation directe de l'élève le long du cycle",
            iacMax: 3,
          },
        ],
      },
    ],
  },
];

/** Total IAC across all criteria = 48 → normalized to /20 */
export const TOTAL_IAC_MAX = EVALUATION_GRID.flatMap((d) =>
  d.activities.flatMap((a) => a.criteria)
).reduce((sum, c) => sum + c.iacMax, 0);

export function getDomains() {
  return EVALUATION_GRID;
}

export function getActivitiesForDomain(domain: KnowledgeDomain) {
  return EVALUATION_GRID.find((d) => d.domain === domain)?.activities ?? [];
}

export function getCriteriaForActivity(
  domain: KnowledgeDomain,
  activity: GridActivity
) {
  return (
    getActivitiesForDomain(domain).find((a) => a.activity === activity)
      ?.criteria ?? []
  );
}

export function getCriteriaEntry(
  domain: KnowledgeDomain,
  activity: GridActivity,
  criteria: EvaluationCriteria
): GridCriteriaEntry | undefined {
  return getCriteriaForActivity(domain, activity).find(
    (c) => c.criteria === criteria
  );
}

export function flattenGridEntries() {
  return EVALUATION_GRID.flatMap((d) =>
    d.activities.flatMap((a) =>
      a.criteria.map((c) => ({
        knowledgeDomain: d.domain,
        family: a.activity,
        criteria: c.criteria,
        definition: c.definition,
        tool: c.tool,
        iacMax: c.iacMax,
      }))
    )
  );
}

export type ResolvedGridRow = {
  knowledgeDomain: KnowledgeDomain;
  family: ActivityFamily;
  criteria: EvaluationCriteria;
  definition: EvaluationDefinition;
  tool: EvaluationTool;
  iacMax: number;
};

/** Resolve canonical domain + activity from criteria (each criteria is unique in the grid). */
export function resolveGridRow(
  criteria: EvaluationCriteria
): ResolvedGridRow | undefined {
  for (const d of EVALUATION_GRID) {
    for (const a of d.activities) {
      const match = a.criteria.find((c) => c.criteria === criteria);
      if (match) {
        return {
          knowledgeDomain: d.domain,
          family:
            a.activity === "TOUTES_ACTIVITES"
              ? "ATHLETISME"
              : a.activity,
          criteria: match.criteria,
          definition: match.definition,
          tool: match.tool,
          iacMax: match.iacMax,
        };
      }
    }
  }
  return undefined;
}
