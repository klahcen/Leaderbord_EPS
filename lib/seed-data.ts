import type { ActivityFamily, Gender, SubActivity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALL_SUB_ACTIVITIES } from "@/lib/activity-config";
import { flattenGridEntries } from "@/lib/evaluation-grid";

const CANONICAL_CLASS_CODES = ["CLA001", "CLA002", "CLA003"] as const;

const DEFAULT_SUB_BY_FAMILY: Record<ActivityFamily, SubActivity> = {
  ATHLETISME: "COURSE_VITESSE",
  SPORTS_COLLECTIFS: "FOOTBALL",
  GYMNASTIQUE: "GYMNASTIQUE_SOL",
};

export async function dedupeSchoolClasses() {
  for (const code of CANONICAL_CLASS_CODES) {
    const keep = await prisma.schoolClass.findUnique({ where: { code } });
    if (!keep) continue;

    const duplicates = await prisma.schoolClass.findMany({
      where: { name: keep.name, NOT: { id: keep.id } },
    });

    for (const dup of duplicates) {
      await prisma.$transaction([
        prisma.student.updateMany({
          where: { classId: dup.id },
          data: { classId: keep.id },
        }),
        prisma.schoolClass.delete({ where: { id: dup.id } }),
      ]);
    }
  }
}

export async function upsertSchoolClasses() {
  await dedupeSchoolClasses();

  return Promise.all([
    prisma.schoolClass.upsert({
      where: { code: "CLA001" },
      update: {},
      create: { name: "Class A", code: "CLA001" },
    }),
    prisma.schoolClass.upsert({
      where: { code: "CLA002" },
      update: {},
      create: { name: "Class B", code: "CLA002" },
    }),
    prisma.schoolClass.upsert({
      where: { code: "CLA003" },
      update: {},
      create: { name: "Class C", code: "CLA003" },
    }),
  ]);
}

export async function upsertSeedStudent(index: number, classId: string) {
  const code = `STU${String(index + 1).padStart(3, "0")}`;
  return prisma.student.upsert({
    where: { studentCode: code },
    update: {},
    create: {
      name: `Student ${index + 1}`,
      studentCode: code,
      schoolClass: { connect: { id: classId } },
      age: 12 + (index % 5),
      gender: (index % 2 === 0 ? "MALE" : "FEMALE") as Gender,
    },
  });
}

const GRID_ENTRIES = flattenGridEntries().map((entry) => ({
  ...entry,
  family:
    entry.family === "TOUTES_ACTIVITES"
      ? ("ATHLETISME" as ActivityFamily)
      : (entry.family as ActivityFamily),
  subActivity: DEFAULT_SUB_BY_FAMILY[
    entry.family === "TOUTES_ACTIVITES"
      ? "ATHLETISME"
      : (entry.family as ActivityFamily)
  ],
}));

export async function createProgressLog(data: {
  studentId: string;
  professorId: string;
  family: ActivityFamily;
  subActivity: SubActivity;
  knowledgeDomain: (typeof GRID_ENTRIES)[number]["knowledgeDomain"];
  criteria: (typeof GRID_ENTRIES)[number]["criteria"];
  definition: (typeof GRID_ENTRIES)[number]["definition"];
  tool: (typeof GRID_ENTRIES)[number]["tool"];
  iacMax: number;
  score: number;
  semester: number;
  notes: string | null;
  recordedAt: Date;
}) {
  return prisma.progressLog.create({ data });
}

export function getSeedGridEntries() {
  return GRID_ENTRIES;
}

export function getSeedSubActivities() {
  return ALL_SUB_ACTIVITIES;
}
