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

async function main() {
  const professorEmail = "Aya@sefyani.lakrizi";
  const professorPassword = "LAHCEN@AYA2026";
  const hashedPassword = await bcrypt.hash(professorPassword, 10);

  const professor = await prisma.user.upsert({
    where: { email: professorEmail },
    update: {
      name: "Prof. Aya SEFYANI LAKRIZI",
      password: hashedPassword,
      role: "PROFESSOR",
    },
    create: {
      name: "Prof. Aya SEFYANI LAKRIZI",
      email: professorEmail,
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

  console.log(
    `Seed completed: 1 professor, 3 classes, ${roster.length} students, Moroccan EPS activity logs`
  );
  console.log(`Professor login — email: ${professorEmail}  password: ${professorPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
