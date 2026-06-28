import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { startOfWeek } from "date-fns";
import { Users, ClipboardList, TrendingUp, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getClassAverageScore,
  getTopStudent,
  getTopStudentScores,
} from "@/lib/utils/student-stats";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudentTable, RecentActivityFeed } from "@/components/dashboard/StudentTable";
import { CategoryBarChart } from "@/components/dashboard/ProgressChart";
import { WeeklyReportButton } from "@/components/dashboard/WeeklyReportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markOutOf20ToGradeLabel } from "@/lib/utils/qualitative-grades";

async function getDashboardData() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const [
    totalStudents,
    logsThisWeek,
    recentLogs,
    classAvg,
    topStudent,
    top5,
    domainAvgs,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.progressLog.count({
      where: { recordedAt: { gte: weekStart } },
    }),
    prisma.progressLog.findMany({
      take: 10,
      orderBy: { recordedAt: "desc" },
      include: { student: { select: { name: true } } },
    }),
    getClassAverageScore(),
    getTopStudent(),
    getTopStudentScores(5),
    prisma.progressLog.groupBy({
      by: ["knowledgeDomain"],
      _sum: { score: true, iacMax: true },
    }),
  ]);

  const categoryChartData = domainAvgs.map((d) => ({
    category: d.knowledgeDomain,
    avgScore:
      d._sum.iacMax && d._sum.iacMax > 0
        ? Math.round(((d._sum.score ?? 0) / d._sum.iacMax) * 20 * 10) / 10
        : 0,
  }));

  return {
    totalStudents,
    logsThisWeek,
    classAvg,
    topStudent,
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      studentName: l.student.name,
      criteria: l.criteria,
      knowledgeDomain: l.knowledgeDomain,
      score: l.score,
      iacMax: l.iacMax,
      recordedAt: l.recordedAt,
    })),
    top5,
    categoryChartData,
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const data = await getDashboardData();

  return (
    <div>
      <Header title={t("title")} description={t("description")}>
        <WeeklyReportButton />
      </Header>

      <section className="kpi-grid">
        <StatsCard
          title={t("totalStudents")}
          value={data.totalStudents}
          icon={Users}
        />
        <StatsCard
          title={t("weeklyLogs")}
          value={data.logsThisWeek}
          icon={ClipboardList}
        />
        <StatsCard
          title={t("avgScore")}
          value={markOutOf20ToGradeLabel(data.classAvg, locale)}
          icon={TrendingUp}
          highlight
        />
        <StatsCard
          title={t("topStudent")}
          value={data.topStudent?.name ?? "—"}
          description={
            data.topStudent
              ? t("topStudentDesc", {
                  grade: markOutOf20ToGradeLabel(data.topStudent.avgScore, locale),
                })
              : undefined
          }
          icon={Award}
        />
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed logs={data.recentLogs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("scoreByCategory")}</CardTitle>
          </CardHeader>
          <CardContent className="chart-responsive">
            <CategoryBarChart data={data.categoryChartData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("top5")}</CardTitle>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/students">{t("viewAll")}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <StudentTable students={data.top5} />
        </CardContent>
      </Card>
    </div>
  );
}
