import { prisma } from "@/lib/prisma";
import { NewStudentForm } from "./NewStudentForm";

export default async function NewStudentPage() {
  const classes = await prisma.schoolClass.findMany({ orderBy: { name: "asc" } });
  return <NewStudentForm classes={classes} />;
}
