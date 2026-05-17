"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

function generateClassCode() {
  return `CLS${Math.floor(Math.random() * 9000) + 1000}`;
}

export type DeleteClassMode = "setNull" | "cascade";

export async function getClasses() {
  await requireAuth();
  return prisma.schoolClass.findMany({ orderBy: { name: "asc" } });
}

export async function createClass(data: { name: string; code?: string }) {
  await requireAuth();

  const name = data.name?.trim();
  if (!name) throw new Error("NAME_REQUIRED");

  const code = data.code?.trim() || generateClassCode();

  const existing = await prisma.schoolClass.findUnique({ where: { code } });
  if (existing) throw new Error("CODE_EXISTS");

  const cls = await prisma.schoolClass.create({
    data: { name, code },
  });

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return cls;
}

export async function updateClass(
  id: string,
  data: { name?: string; code?: string }
) {
  await requireAuth();

  const name = data.name?.trim();
  const code = data.code?.trim();

  if (code) {
    const existing = await prisma.schoolClass.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) throw new Error("CODE_EXISTS");
  }

  const cls = await prisma.schoolClass.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(code !== undefined ? { code } : {}),
    },
  });

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return cls;
}

export async function deleteClass(id: string, mode: DeleteClassMode = "setNull") {
  await requireAuth();

  if (mode === "cascade") {
    await prisma.$transaction([
      prisma.student.deleteMany({ where: { classId: id } }),
      prisma.schoolClass.delete({ where: { id } }),
    ]);
  } else {
    await prisma.schoolClass.delete({ where: { id } });
  }

  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
}

export async function getClassStudentCount(classId: string) {
  await requireAuth();
  return prisma.student.count({ where: { classId } });
}
