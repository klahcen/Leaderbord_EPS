import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = Object.values(Category);

async function main() {
  const professor = await prisma.user.upsert({
    where: { email: "prof@pe.school" },
    update: {},
    create: {
      name: "Prof. Ali Alouch",
      email: "prof@pe.school",
      password: await bcrypt.hash("password123", 10),
      role: "PROFESSOR",
    },
  });

  const classes = ["Class A", "Class B", "Class C"];
  const studentRecords = [];

  for (let i = 0; i < 10; i++) {
    const student = await prisma.student.upsert({
      where: { studentCode: `STU${String(i + 1).padStart(3, "0")}` },
      update: {},
      create: {
        name: `Student ${i + 1}`,
        studentCode: `STU${String(i + 1).padStart(3, "0")}`,
        className: classes[i % 3],
        age: 12 + (i % 5),
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
      },
    });
    studentRecords.push(student);
  }

  for (const student of studentRecords) {
    for (const category of categories) {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - daysAgo);

        await prisma.progressLog.create({
          data: {
            studentId: student.id,
            professorId: professor.id,
            category,
            score: 50 + Math.random() * 50,
            maxScore: 100,
            notes: j === 0 ? `Assessment for ${category.toLowerCase()}` : null,
            recordedAt,
          },
        });
      }
    }
  }

  console.log("Seed completed: 1 professor, 10 students, progress logs created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
