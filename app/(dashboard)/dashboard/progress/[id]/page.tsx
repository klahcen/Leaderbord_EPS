import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/Header";
import { ProgressForm } from "@/components/dashboard/ProgressForm";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("progress");

  const [log, students] = await Promise.all([
    prisma.progressLog.findUnique({ where: { id: params.id } }),
    prisma.student.findMany({
      select: { id: true, name: true, studentCode: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!log) notFound();

  return (
    <div>
      <Header title={t("editTitle")} description={t("editDescription")} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <ProgressForm
            students={students}
            initialData={{
              id: log.id,
              studentId: log.studentId,
              category: log.category,
              score: log.score,
              maxScore: log.maxScore,
              notes: log.notes ?? undefined,
              recordedAt: log.recordedAt,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
