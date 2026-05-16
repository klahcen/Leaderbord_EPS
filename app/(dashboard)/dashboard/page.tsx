import Link from "next/link";
import { getTranslations, getFormatter } from "next-intl/server";
import { startOfWeek } from "date-fns";
import { Users, ClipboardList, TrendingUp, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudentTable, RecentActivityFeed } from "@/components/dashboard/StudentTable";
import { CategoryBarChart } from "@/components/dashboard/ProgressChart";
import { WeeklyReportButton } from "@/components/dashboard/WeeklyReportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getDashboardData() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const [totalStudents, logsThisWeek, recentLogs, studentsWithLogs, categoryAvgs] =
    await Promise.all([
      prisma.student.count(),
      prisma.progressLog.count({
        where: { recordedAt: { gte: weekStart } },
      }),
      prisma.progressLog.findMany({
        take: 10,
        orderBy: { recordedAt: "desc" },
        include: { student: { select: { name: true } } },
      }),
      prisma.student.findMany({
        include: {
          progressLogs: {
            select: { score: true, maxScore: true, recordedAt: true },
            orderBy: { recordedAt: "desc" },
          },
        },
      }),
      prisma.progressLog.groupBy({
        by: ["category"],
        _avg: { score: true },
      }),
    ]);

  const studentScores = studentsWithLogs.map((s) => {
    const logs = s.progressLogs;
    const avg =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + (l.score / l.maxScore) * 100, 0) / logs.length
        : 0;
    return {
      id: s.id,
      name: s.name,
      studentCode: s.studentCode,
      className: s.className,
      avgScore: Math.round(avg * 10) / 10,
      lastActivity: logs[0]?.recordedAt ?? null,
    };
  });

  const classAvg =
    studentScores.length > 0
      ? Math.round(
          (studentScores.reduce((s, st) => s + st.avgScore, 0) / studentScores.length) * 10
        ) / 10
      : 0;

  const topStudent = [...studentScores].sort((a, b) => b.avgScore - a.avgScore)[0];

  const categoryChartData = categoryAvgs.map((c) => ({
    category: c.category,
    avgScore: Math.round((c._avg.score ?? 0) * 10) / 10,
  }));

  return {
    totalStudents,
    logsThisWeek,
    classAvg,
    topStudent,
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      studentName: l.student.name,
      category: l.category,
      score: l.score,
      maxScore: l.maxScore,
      recordedAt: l.recordedAt,
    })),
    top5: [...studentScores].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5),
    categoryChartData,
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const format = await getFormatter();
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
          value={`${format.number(data.classAvg, { maximumFractionDigits: 1 })}%`}
          icon={TrendingUp}
          highlight
        />
        <StatsCard
          title={t("topStudent")}
          value={data.topStudent?.name ?? "—"}
          description={
            data.topStudent
              ? t("topStudentDesc", {
                  score: format.number(data.topStudent.avgScore, {
                    maximumFractionDigits: 1,
                  }),
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
          <CardContent>
            <CategoryBarChart data={data.categoryChartData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("top5")}</CardTitle>
          <Button variant="outline" size="sm" asChild>
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
