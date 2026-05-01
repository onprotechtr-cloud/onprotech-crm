"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkPlanPriority, WorkPlanStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function createWorkPlan(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum açmanız gerekiyor.");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const customerId = formData.get("customerId") as string;
  const priority = formData.get("priority") as string;
  const dueDate = formData.get("dueDate") as string;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;

  if (!title) throw new Error("Başlık zorunludur.");

  await prisma.workPlan.create({
    data: {
      title,
      description: description || null,
      assignedToId: assignedToId || null,
      customerId: customerId || null,
      priority: (priority as WorkPlanPriority) || WorkPlanPriority.NORMAL,
      status: WorkPlanStatus.YAPILACAK,
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || null,
      notes: notes || null,
      createdById: (session.user as { id: string }).id,
    },
  });

  revalidatePath("/dashboard/is-plani");
  redirect("/dashboard/is-plani");
}

export async function updateWorkPlan(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const customerId = formData.get("customerId") as string;
  const priority = formData.get("priority") as string;
  const status = formData.get("status") as string;
  const dueDate = formData.get("dueDate") as string;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;

  await prisma.workPlan.update({
    where: { id },
    data: {
      title,
      description: description || null,
      assignedToId: assignedToId || null,
      customerId: customerId || null,
      priority: (priority as WorkPlanPriority) || WorkPlanPriority.NORMAL,
      status: (status as WorkPlanStatus) || WorkPlanStatus.YAPILACAK,
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || null,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard/is-plani");
  revalidatePath(`/dashboard/is-plani/${id}/duzenle`);
  redirect("/dashboard/is-plani");
}

export async function updateWorkPlanStatus(id: string, status: string): Promise<void> {
  const data: { status: WorkPlanStatus; completedDate?: Date | null } = {
    status: status as WorkPlanStatus,
  };

  if (status === WorkPlanStatus.TAMAMLANDI) {
    data.completedDate = new Date();
  } else {
    data.completedDate = null;
  }

  await prisma.workPlan.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/is-plani");
}

export async function deleteWorkPlan(id: string): Promise<void> {
  await prisma.workPlan.delete({ where: { id } });
  revalidatePath("/dashboard/is-plani");
  redirect("/dashboard/is-plani");
}
