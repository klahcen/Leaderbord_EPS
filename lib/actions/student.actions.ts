"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StudentFormData } from "@/types";
import type { Gender } from "@prisma/client";
import { Prisma } from "@prisma/client";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

function generateStudentCode() {
  return `STU${Math.floor(Math.random() * 9000) + 1000}`;
}

function parseGender(value?: string | null): Gender | null {
  if (!value || value === "") return null;
  return value as Gender;
}

function schoolClassRelation(classId?: string | null) {
  if (classId === undefined) return {};
  if (classId) return { schoolClass: { connect: { id: classId } } };
  return { schoolClass: { disconnect: true } };
}

export async function createStudent(data: StudentFormData) {
  await requireAuth();

  const name = data.name?.trim();
  if (!name) throw new Error("NAME_REQUIRED");

  const studentCode = data.studentCode?.trim() || generateStudentCode();

  const existing = await prisma.student.findUnique({ where: { studentCode } });
  if (existing) throw new Error("CODE_EXISTS");

  try {
    const student = await prisma.student.create({
      data: {
        name,
        studentCode,
        ...schoolClassRelation(data.classId ?? null),
        age: data.age ?? null,
        gender: parseGender(data.gender as string | undefined),
        avatarUrl: data.avatarUrl ?? null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/students");
    revalidatePath("/leaderboard");

    return student;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("CODE_EXISTS");
    }
    throw error;
  }
}

export async function updateStudent(id: string, data: Partial<StudentFormData>) {
  await requireAuth();

  const studentCode = data.studentCode?.trim();
  if (studentCode) {
    const existing = await prisma.student.findFirst({
      where: { studentCode, NOT: { id } },
    });
    if (existing) throw new Error("CODE_EXISTS");
  }

  try {
    const student = await prisma.$transaction(async (tx) => {
      return tx.student.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(studentCode !== undefined ? { studentCode } : {}),
          ...schoolClassRelation(data.classId),
          ...(data.age !== undefined ? { age: data.age ?? null } : {}),
          ...(data.gender !== undefined
            ? { gender: parseGender(data.gender as string | undefined) }
            : {}),
          ...(data.avatarUrl !== undefined
            ? { avatarUrl: data.avatarUrl ?? null }
            : {}),
        },
      });
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${id}`);
    revalidatePath(`/dashboard/students/${id}/edit`);
    revalidatePath("/leaderboard");

    return student;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("CODE_EXISTS");
    }
    throw error;
  }
}

export async function deleteStudent(id: string) {
  await requireAuth();

  await prisma.student.delete({ where: { id } });

  revalidatePath("/dashboard/students");
  revalidatePath("/leaderboard");
}
