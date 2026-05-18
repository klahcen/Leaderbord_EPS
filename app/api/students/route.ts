import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const classId = searchParams.get("classId");
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
        classId ? { classId } : {},
        gender ? { gender: gender as "MALE" | "FEMALE" | "OTHER" } : {},
      ],
    },
    include: {
      schoolClass: true,
      progressLogs: { select: { score: true, iacMax: true, recordedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const studentCode =
    body.studentCode?.trim() || `STU${Math.floor(Math.random() * 9000) + 1000}`;

  try {
    const student = await prisma.student.create({
      data: {
        name: body.name,
        studentCode,
        ...(body.classId
          ? { schoolClass: { connect: { id: body.classId } } }
          : {}),
        age: body.age ?? null,
        gender: body.gender ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
    });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 400 });
  }
}
