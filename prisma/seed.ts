import { prisma } from "@/lib/prisma";
import { PROFESSOR_EMAIL, PROFESSOR_PASSWORD, runSeed } from "@/lib/run-seed";

async function main() {
  const { students } = await runSeed();
  console.log(
    `Seed completed: 1 professor, 3 classes, ${students} students, Moroccan EPS activity logs`
  );
  console.log(
    `Professor login — email: ${PROFESSOR_EMAIL}  password: ${PROFESSOR_PASSWORD}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
