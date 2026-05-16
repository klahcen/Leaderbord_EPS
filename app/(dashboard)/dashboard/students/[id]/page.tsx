import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/Header";
import { ProgressLineChart } from "@/components/dashboard/ProgressChart";
import { StudentProgressFilter } from "@/components/dashboard/StudentProgressFilter";
import { AIAnalysisButton } from "@/components/dashboard/AIAnalysisButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: { id: string };
  searchParams: { category?: string };
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const t = await getTranslations("students");
  const tCat = await getTranslations("categories");
  const format = await getFormatter();

  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      progressLogs: {
        orderBy: { recordedAt: "desc" },
        ...(searchParams.category && searchParams.category !== "ALL"
          ? { where: { category: searchParams.category as never } }
          : {}),
      },
    },
  });

  if (!student) notFound();

  const avgScore =
    student.progressLogs.length > 0
      ? Math.round(
          (student.progressLogs.reduce(
            (s, l) => s + (l.score / l.maxScore) * 100,
            0
          ) /
            student.progressLogs.length) *
            10
        ) / 10
      : 0;

  return (
    <div>
      <Header
        title={student.name}
        description={`${student.className} · ${student.studentCode}`}
      >
        <Button asChild>
          <Link href={`/dashboard/progress?studentId=${student.id}`}>
            {t("addProgress")}
          </Link>
        </Button>
      </Header>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap gap-6 pt-6">
          <div>
            <p className="text-sm text-muted-foreground">{t("class")}</p>
            <p className="font-medium">{student.className}</p>
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
            <p className="text-sm text-muted-foreground">{t("detailAvgScore")}</p>
            <p className="text-2xl font-bold text-primary">
              {format.number(avgScore, { maximumFractionDigits: 1 })}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <AIAnalysisButton studentId={student.id} />
      </div>

      <div className="mb-6">
        <StudentProgressFilter
          studentId={student.id}
          active={searchParams.category ?? "ALL"}
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>{t("progressHistory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">{t("date")}</th>
                    <th className="py-2 text-left">{t("category")}</th>
                    <th className="py-2 text-left">{t("avgScore")}</th>
                    <th className="py-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {student.progressLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-2 text-muted-foreground">
                        {format.dateTime(new Date(log.recordedAt), {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-2">
                        <Badge variant="outline">{tCat(log.category)}</Badge>
                      </td>
                      <td className="py-2 font-medium">
                        {format.number(
                          Math.round((log.score / log.maxScore) * 100),
                          { maximumFractionDigits: 0 }
                        )}
                        %
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/progress/${log.id}`}>
                            {t("edit")}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
