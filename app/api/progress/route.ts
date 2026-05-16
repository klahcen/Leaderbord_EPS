import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  const logs = await prisma.progressLog.findMany({
    where: studentId ? { studentId } : {},
    include: { student: { select: { name: true } } },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const log = await prisma.progressLog.create({
    data: {
      ...body,
      professorId: session.user.id,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
