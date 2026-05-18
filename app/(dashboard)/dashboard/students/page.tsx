import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { countStudents, getStudentScoreRows } from "@/lib/utils/student-stats";
import { Header } from "@/components/dashboard/Header";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { Suspense } from "react";
import { StudentsFilter } from "@/components/dashboard/StudentsFilter";
import ClassList from "@/components/ClassList";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: {
    search?: string;
    classId?: string;
    gender?: string;
    page?: string;
  };
}

const PAGE_SIZE = 10;

export default async function StudentsPage({ searchParams }: PageProps) {
  const t = await getTranslations("students");
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.search ?? "";
  const classId = searchParams.classId;
  const gender = searchParams.gender;

  const filters = { search, classId, gender };

  const [rows, total, classes] = await Promise.all([
    getStudentScoreRows({
      ...filters,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    countStudents(filters),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <Header title={t("title")} description={t("description")}>
        <Button asChild>
          <Link href="/dashboard/students/new">{t("addStudent")}</Link>
        </Button>
      </Header>

      <ClassList classes={classes} />

      <Suspense fallback={<div className="h-10" />}>
        <StudentsFilter
          classes={classes}
          current={{ search, classId, gender }}
        />
      </Suspense>

      <div className="mt-6">
        <StudentTable students={rows} showActions />
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/students?page=${page - 1}&search=${search}&classId=${classId ?? ""}&gender=${gender ?? ""}`}
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
                href={`/dashboard/students?page=${page + 1}&search=${search}&classId=${classId ?? ""}&gender=${gender ?? ""}`}
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
