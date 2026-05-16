import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/Header";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { Suspense } from "react";
import { StudentsFilter } from "@/components/dashboard/StudentsFilter";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: {
    search?: string;
    className?: string;
    gender?: string;
    page?: string;
  };
}

const PAGE_SIZE = 10;

export default async function StudentsPage({ searchParams }: PageProps) {
  const t = await getTranslations("students");
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";
  const className = searchParams.className;
  const gender = searchParams.gender;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { studentCode: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      className ? { className } : {},
      gender ? { gender: gender as "MALE" | "FEMALE" } : {},
    ],
  };

  const [students, total, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        progressLogs: {
          select: { score: true, maxScore: true, recordedAt: true },
          orderBy: { recordedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
    prisma.student.findMany({
      select: { className: true },
      distinct: ["className"],
    }),
  ]);

  const rows = students.map((s) => {
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <Header title={t("title")} description={t("description")}>
        <Button asChild>
          <Link href="/dashboard/students/new">{t("addStudent")}</Link>
        </Button>
      </Header>

      <Suspense fallback={<div className="h-10" />}>
        <StudentsFilter
          classes={classes.map((c) => c.className)}
          current={{ search, className, gender }}
        />
      </Suspense>

      <div className="mt-6">
        <StudentTable students={rows} />
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/students?page=${page - 1}&search=${search}&className=${className ?? ""}&gender=${gender ?? ""}`}
              >
                {t("previous")}
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            {t("page", { current: page, total: totalPages })}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/students?page=${page + 1}&search=${search}&className=${className ?? ""}&gender=${gender ?? ""}`}
              >
                {t("next")}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
