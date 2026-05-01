"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { auth } from "@/lib/auth";

async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count({
    where: { ticketNumber: { startsWith: `TKT-${year}-` } },
  });
  return `TKT-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createTicket(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum açmanız gerekiyor.");

  const customerId = formData.get("customerId") as string;
  const subject = formData.get("subject") as string;
  const priority = formData.get("priority") as string;
  const category = formData.get("category") as string;
  const message = formData.get("message") as string;

  if (!customerId || !subject || !message) {
    throw new Error("Müşteri, konu ve mesaj zorunludur.");
  }

  const ticketNumber = await generateTicketNumber();
  const userId = (session.user as { id: string }).id;

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      customerId,
      createdById: userId,
      subject,
      status: TicketStatus.ACIK,
      priority: (priority as TicketPriority) || TicketPriority.NORMAL,
      category: category || null,
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      senderId: userId,
      message,
      isInternal: false,
    },
  });

  revalidatePath("/dashboard/destek");
  redirect(`/dashboard/destek/${ticket.id}`);
}

export async function addTicketMessage(ticketId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Oturum açmanız gerekiyor.");

  const message = formData.get("message") as string;
  const isInternalVal = formData.get("isInternal");
  const isInternal = isInternalVal === "on" || isInternalVal === "true" || isInternalVal === "1";

  if (!message) throw new Error("Mesaj boş olamaz.");

  const userId = (session.user as { id: string }).id;

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: userId,
      message,
      isInternal,
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  revalidatePath(`/dashboard/destek/${ticketId}`);
}

export async function updateTicketStatus(id: string, status: string): Promise<void> {
  await prisma.ticket.update({
    where: { id },
    data: { status: status as TicketStatus },
  });

  revalidatePath("/dashboard/destek");
  revalidatePath(`/dashboard/destek/${id}`);
}

export async function assignTicket(id: string, assignedToId: string): Promise<void> {
  await prisma.ticket.update({
    where: { id },
    data: { assignedToId: assignedToId || null },
  });

  revalidatePath(`/dashboard/destek/${id}`);
}
