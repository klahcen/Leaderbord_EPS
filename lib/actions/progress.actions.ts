"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProgressFormData } from "@/types";
import type { Category } from "@prisma/client";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function logProgress(data: ProgressFormData) {
  const session = await requireAuth();

  await prisma.progressLog.create({
    data: {
      studentId: data.studentId,
      professorId: session.user.id,
      category: data.category as Category,
      score: data.score,
      maxScore: data.maxScore ?? 100,
      notes: data.notes,
      recordedAt: data.recordedAt ?? new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath(`/dashboard/students/${data.studentId}`);
}

export async function updateProgress(id: string, data: ProgressFormData) {
  await requireAuth();

  await prisma.progressLog.update({
    where: { id },
    data: {
      studentId: data.studentId,
      category: data.category as Category,
      score: data.score,
      maxScore: data.maxScore ?? 100,
      notes: data.notes,
      recordedAt: data.recordedAt ?? new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath(`/dashboard/students/${data.studentId}`);
  revalidatePath(`/dashboard/progress/${id}`);
}

export async function deleteProgress(id: string, studentId: string) {
  await requireAuth();

  await prisma.progressLog.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath(`/dashboard/students/${studentId}`);
}
