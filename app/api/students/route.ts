import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const className = searchParams.get("className");
  const gender = searchParams.get("gender");

  const students = await prisma.student.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { studentCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        className ? { className } : {},
        gender ? { gender: gender as "MALE" | "FEMALE" } : {},
      ],
    },
    include: {
      progressLogs: { select: { score: true, maxScore: true, recordedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const student = await prisma.student.create({ data: body });
  return NextResponse.json(student, { status: 201 });
}
