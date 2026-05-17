import type { Category, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CANONICAL_CLASS_CODES = ["CLA001", "CLA002", "CLA003"] as const;

/** Remove duplicate class rows (e.g. from pre-migration data) keeping CLA001–003. */
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

export async function upsertSeedStudent(
  index: number,
  classId: string
) {
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

export async function createProgressLog(data: {
  studentId: string;
  professorId: string;
  category: Category;
  score: number;
  notes: string | null;
  recordedAt: Date;
}) {
  return prisma.progressLog.create({
    data: {
      studentId: data.studentId,
      professorId: data.professorId,
      category: data.category,
      score: data.score,
      maxScore: 100,
      notes: data.notes,
      recordedAt: data.recordedAt,
    },
  });
}
