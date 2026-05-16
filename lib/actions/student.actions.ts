"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StudentFormData } from "@/types";
import type { Gender } from "@prisma/client";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createStudent(data: StudentFormData) {
  await requireAuth();

  const student = await prisma.student.create({
    data: {
      name: data.name,
      studentCode: data.studentCode,
      className: data.className,
      age: data.age,
      gender: data.gender as Gender | undefined,
      avatarUrl: data.avatarUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/students");
  revalidatePath("/leaderboard");

  return student;
}

export async function updateStudent(id: string, data: Partial<StudentFormData>) {
  await requireAuth();

  const student = await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      studentCode: data.studentCode,
      className: data.className,
      age: data.age,
      gender: data.gender as Gender | undefined,
      avatarUrl: data.avatarUrl,
    },
  });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${id}`);
  revalidatePath("/leaderboard");

  return student;
}

export async function deleteStudent(id: string) {
  await requireAuth();

  await prisma.student.delete({ where: { id } });

  revalidatePath("/dashboard/students");
  revalidatePath("/leaderboard");
}
