import { Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createProgressLog,
  upsertSchoolClasses,
  upsertSeedStudent,
} from "@/lib/seed-data";

const categories = Object.values(Category);

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

  for (let i = 0; i < 10; i++) {
    const student = await upsertSeedStudent(i, classRecords[i % 3].id);
    studentRecords.push(student);
  }

  for (const student of studentRecords) {
    for (const category of categories) {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - daysAgo);

        await createProgressLog({
          studentId: student.id,
          professorId: professor.id,
          category,
          score: 50 + Math.random() * 50,
          notes: j === 0 ? `Assessment for ${category.toLowerCase()}` : null,
          recordedAt,
        });
      }
    }
  }

  console.log(
    "Seed completed: 1 professor, 3 classes, 10 students, progress logs created"
  );
  console.log(`Professor login — email: ${professorEmail}  password: ${professorPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
