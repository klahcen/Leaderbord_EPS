import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditStudentForm } from "./EditStudentForm";

interface PageProps {
  params: { id: string };
}

export default async function EditStudentPage({ params }: PageProps) {
  const [student, classes] = await Promise.all([
    prisma.student.findUnique({ where: { id: params.id } }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!student) notFound();

  return (
    <EditStudentForm
      student={{
        id: student.id,
        name: student.name,
        studentCode: student.studentCode,
        classId: student.classId,
        age: student.age,
        gender: student.gender,
        avatarUrl: student.avatarUrl,
      }}
      classes={classes}
    />
  );
}
