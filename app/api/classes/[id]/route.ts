import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  try {
    const cls = await prisma.schoolClass.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        code: body.code?.trim(),
      },
    });
    return NextResponse.json(cls);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "cascade") {
    await prisma.$transaction([
      prisma.student.deleteMany({ where: { classId: id } }),
      prisma.schoolClass.delete({ where: { id } }),
    ]);
  } else {
    await prisma.schoolClass.delete({ where: { id } });
  }

  return NextResponse.json({ success: true });
}
