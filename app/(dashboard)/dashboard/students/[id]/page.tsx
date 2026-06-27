import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { parseLeaderboardCategory } from "@/lib/constants/leaderboard-categories";
import { calculateMarkOutOf20 } from "@/lib/utils/moroccan-scoring";
import { Header } from "@/components/dashboard/Header";
import { ProgressLineChart } from "@/components/dashboard/ProgressChart";
import { StudentProgressFilter } from "@/components/dashboard/StudentProgressFilter";
import { AIAnalysisButton } from "@/components/dashboard/AIAnalysisButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KnowledgeDomain } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { category } = await searchParams;
  const t = await getTranslations("students");
  const tEval = await getTranslations("evaluation");
  const format = await getFormatter();
  const domainFilter = parseLeaderboardCategory(category);

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      schoolClass: true,
      progressLogs: {
        orderBy: { recordedAt: "desc" },
        ...(domainFilter !== "ALL"
          ? {
              where: {
                knowledgeDomain: domainFilter as KnowledgeDomain,
              },
            }
          : {}),
      },
    },
  });

  if (!student) notFound();

  const totalScore = student.progressLogs.reduce((s, l) => s + l.score, 0);
  const totalMax = student.progressLogs.reduce((s, l) => s + l.iacMax, 0);
  const markOutOf20 = calculateMarkOutOf20(totalScore, totalMax);

  return (
    <div>
      <Header
        title={student.name}
        description={`${student.schoolClass?.name ?? "—"} · ${student.studentCode}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/students/${student.id}/edit`}>
              {t("editStudent")}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/progress?studentId=${student.id}`}>
              {t("addProgress")}
            </Link>
          </Button>
        </div>
      </Header>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap gap-6 pt-6">
          <div>
            <p className="text-sm text-muted-foreground">{t("class")}</p>
            <p className="font-medium">{student.schoolClass?.name ?? "—"}</p>
          </div>
          {student.age && (
            <div>
              <p className="text-sm text-muted-foreground">{t("detailAge")}</p>
              <p className="font-medium">{student.age}</p>
            </div>
          )}
          {student.gender && (
            <div>
              <p className="text-sm text-muted-foreground">{t("detailGender")}</p>
              <p className="font-medium">
                {t(student.gender === "MALE" ? "male" : "female")}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{tEval("finalMark")}</p>
            <p className="text-2xl font-bold text-primary">
              {format.number(markOutOf20, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              /20
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <AIAnalysisButton studentId={student.id} />
      </div>

      <div className="mb-6">
        <StudentProgressFilter studentId={student.id} active={domainFilter} />
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("progressOverTime")}</CardTitle>
          </CardHeader>
          <CardContent>
            {student.progressLogs.length > 0 ? (
              <ProgressLineChart logs={student.progressLogs} />
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                {t("noProgressYet")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
