import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      schoolClass: true,
      progressLogs: { orderBy: { recordedAt: "desc" } },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        studentCode: body.studentCode?.trim(),
        ...(body.classId
          ? { schoolClass: { connect: { id: body.classId } } }
          : { schoolClass: { disconnect: true } }),
        age: body.age ?? null,
        gender: body.gender ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
    });
    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
