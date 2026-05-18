import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TOTAL_IAC_MAX } from "@/lib/evaluation-grid";

export type StudentScoreRow = {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  avgScore: number;
  lastActivity: Date | null;
};

type StudentListFilters = {
  search?: string;
  classId?: string;
  gender?: string;
  skip?: number;
  take?: number;
};

function buildStudentStatsQuery(filters: StudentListFilters = {}) {
  const { search = "", classId, gender, skip, take } = filters;
  const conditions: Prisma.Sql[] = [];

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      Prisma.sql`(s.name ILIKE ${term} OR s."studentCode" ILIKE ${term})`
    );
  }
  if (classId) {
    conditions.push(Prisma.sql`s."classId" = ${classId}`);
  }
  if (gender) {
    conditions.push(Prisma.sql`s.gender = ${gender}::"Gender"`);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

  const pagination =
    take != null
      ? Prisma.sql`LIMIT ${take} OFFSET ${skip ?? 0}`
      : Prisma.empty;

  return Prisma.sql`
    SELECT
      s.id,
      s.name,
      s."studentCode",
      COALESCE(c.name, '—') AS "className",
      ROUND(
        COALESCE(
          (SUM(pl.score)::float / NULLIF(SUM(pl."iacMax"), 0)) * 20,
          0
        )::numeric,
        2
      )::float AS "avgScore",
      MAX(pl."recordedAt") AS "lastActivity"
    FROM "Student" s
    LEFT JOIN "Class" c ON s."classId" = c.id
    LEFT JOIN "ProgressLog" pl ON pl."studentId" = s.id
    ${whereClause}
    GROUP BY s.id, s.name, s."studentCode", c.name
    ORDER BY s.name ASC
    ${pagination}
  `;
}

export async function getStudentScoreRows(
  filters: StudentListFilters = {}
): Promise<StudentScoreRow[]> {
  return prisma.$queryRaw<StudentScoreRow[]>(buildStudentStatsQuery(filters));
}

export async function countStudents(filters: StudentListFilters = {}): Promise<number> {
  const { search = "", classId, gender } = filters;
  const conditions: Prisma.Sql[] = [];

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      Prisma.sql`(s.name ILIKE ${term} OR s."studentCode" ILIKE ${term})`
    );
  }
  if (classId) {
    conditions.push(Prisma.sql`s."classId" = ${classId}`);
  }
  if (gender) {
    conditions.push(Prisma.sql`s.gender = ${gender}::"Gender"`);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

  const result = await prisma.$queryRaw<[{ count: bigint }]>(
    Prisma.sql`SELECT COUNT(*)::bigint AS count FROM "Student" s ${whereClause}`
  );
  return Number(result[0]?.count ?? 0);
}

export async function getClassAverageScore(): Promise<number> {
  const result = await prisma.$queryRaw<[{ avg: number | null }]>(
    Prisma.sql`
      SELECT ROUND(
        (SUM(pl.score)::float / NULLIF(SUM(pl."iacMax"), 0) * 20)::numeric,
        2
      )::float AS avg
      FROM "ProgressLog" pl
    `
  );
  return result[0]?.avg ?? 0;
}

export async function getTopStudent(): Promise<StudentScoreRow | null> {
  const rows = await getTopStudentScores(1);
  return rows[0] ?? null;
}

export async function getTopStudentScores(limit: number): Promise<StudentScoreRow[]> {
  return prisma.$queryRaw<StudentScoreRow[]>(Prisma.sql`
    SELECT
      s.id,
      s.name,
      s."studentCode",
      COALESCE(c.name, '—') AS "className",
      ROUND(
        (SUM(pl.score)::float / NULLIF(SUM(pl."iacMax"), 0) * 20)::numeric,
        2
      )::float AS "avgScore",
      MAX(pl."recordedAt") AS "lastActivity"
    FROM "Student" s
    LEFT JOIN "Class" c ON s."classId" = c.id
    INNER JOIN "ProgressLog" pl ON pl."studentId" = s.id
    GROUP BY s.id, s.name, s."studentCode", c.name
    ORDER BY "avgScore" DESC
    LIMIT ${limit}
  `);
}

export { TOTAL_IAC_MAX };
