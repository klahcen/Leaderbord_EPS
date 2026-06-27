import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createProgressLog,
  getSeedGridEntries,
  getSeedStudentRoster,
  getSeedSubActivities,
  upsertSchoolClasses,
  upsertSeedStudent,
} from "@/lib/seed-data";
import {
  getFamilyEvaluationDefaults,
  getFamilyForSubActivity,
} from "@/lib/activity-config";

export const PROFESSOR_EMAIL = "Aya@sefyani.lakrizi";
export const PROFESSOR_PASSWORD = "LAHCEN@AYA2026";

export async function runSeed(): Promise<{ students: number }> {
  const hashedPassword = await bcrypt.hash(PROFESSOR_PASSWORD, 10);

  const professor = await prisma.user.upsert({
    where: { email: PROFESSOR_EMAIL },
    update: {
      name: "Prof. Aya SEFYANI LAKRIZI",
      password: hashedPassword,
      role: "PROFESSOR",
    },
    create: {
      name: "Prof. Aya SEFYANI LAKRIZI",
      email: PROFESSOR_EMAIL,
      password: hashedPassword,
      role: "PROFESSOR",
    },
  });

  const classRecords = await upsertSchoolClasses();
  const studentRecords = [];
  const roster = getSeedStudentRoster();
  const gridEntries = getSeedGridEntries();
  const subActivities = getSeedSubActivities();

  for (let i = 0; i < roster.length; i++) {
    const student = await upsertSeedStudent(
      i,
      roster[i],
      classRecords[i % classRecords.length].id
    );
    studentRecords.push(student);
  }

  for (const student of studentRecords) {
    const existingLogs = await prisma.progressLog.count({
      where: { studentId: student.id },
    });
    if (existingLogs > 0) continue;

    for (const sub of subActivities) {
      const family = getFamilyForSubActivity(sub);
      const defaults = getFamilyEvaluationDefaults(family);
      const recordedAt = new Date();
      recordedAt.setDate(recordedAt.getDate() - Math.floor(Math.random() * 60));
      const ratio = 0.45 + Math.random() * 0.45;
      const score = Math.round(defaults.iacMax * ratio * 10) / 10;

      await createProgressLog({
        studentId: student.id,
        professorId: professor.id,
        family,
        subActivity: sub,
        knowledgeDomain: defaults.knowledgeDomain,
        criteria: defaults.criteria,
        definition: defaults.definition,
        tool: defaults.tool,
        iacMax: defaults.iacMax,
        score,
        semester: Math.random() > 0.5 ? 1 : 2,
        notes: `Évaluation ${sub}`,
        recordedAt,
      });
    }

    for (const entry of gridEntries) {
      if (entry.knowledgeDomain === "PROCEDURALE") continue;
      const recordedAt = new Date();
      recordedAt.setDate(recordedAt.getDate() - Math.floor(Math.random() * 60));
      const ratio = 0.45 + Math.random() * 0.45;
      const score = Math.round(entry.iacMax * ratio * 10) / 10;

      await createProgressLog({
        studentId: student.id,
        professorId: professor.id,
        family: entry.family,
        subActivity: entry.subActivity,
        knowledgeDomain: entry.knowledgeDomain,
        criteria: entry.criteria,
        definition: entry.definition,
        tool: entry.tool,
        iacMax: entry.iacMax,
        score,
        semester: Math.random() > 0.5 ? 1 : 2,
        notes: `Évaluation ${entry.criteria}`,
        recordedAt,
      });
    }
  }

  return { students: roster.length };
}

let seedInFlight: Promise<{ students: number }> | null = null;

/** Idempotent — safe to call on deploy, health checks, or manual seed. */
export async function ensureSeeded(): Promise<{ students: number; seeded: boolean }> {
  if (process.env.RUN_DB_SEED === "false") {
    const students = await prisma.student.count();
    return { students, seeded: false };
  }

  const existing = await prisma.student.count();
  if (existing > 0) {
    return { students: existing, seeded: false };
  }

  if (!seedInFlight) {
    seedInFlight = runSeed().finally(() => {
      seedInFlight = null;
    });
  }

  const result = await seedInFlight;
  return { students: result.students, seeded: true };
}
