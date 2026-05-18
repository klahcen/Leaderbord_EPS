"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProgressFormData } from "@/types";
import type {
  ActivityFamily,
  EvaluationCriteria,
  EvaluationDefinition,
  EvaluationTool,
  KnowledgeDomain,
  SubActivity,
} from "@prisma/client";

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
      family: data.family as ActivityFamily,
      subActivity: data.subActivity as SubActivity,
      knowledgeDomain: data.knowledgeDomain as KnowledgeDomain,
      criteria: data.criteria as EvaluationCriteria,
      definition: data.definition as EvaluationDefinition,
      tool: data.tool as EvaluationTool,
      iacMax: data.iacMax,
      score: data.score,
      semester: data.semester,
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
      family: data.family as ActivityFamily,
      subActivity: data.subActivity as SubActivity,
      knowledgeDomain: data.knowledgeDomain as KnowledgeDomain,
      criteria: data.criteria as EvaluationCriteria,
      definition: data.definition as EvaluationDefinition,
      tool: data.tool as EvaluationTool,
      iacMax: data.iacMax,
      score: data.score,
      semester: data.semester,
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
