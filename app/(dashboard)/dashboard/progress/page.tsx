import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/Header";
import { ProgressForm } from "@/components/dashboard/ProgressForm";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  searchParams: { studentId?: string };
}

export default async function ProgressPage({ searchParams }: PageProps) {
  const t = await getTranslations("progress");

  const students = await prisma.student.findMany({
    select: { id: true, name: true, studentCode: true },
    orderBy: { name: "asc" },
  });

  const initialData = searchParams.studentId
    ? { studentId: searchParams.studentId }
    : undefined;

  return (
    <div>
      <Header title={t("title")} description={t("description")} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <ProgressForm students={students} initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
