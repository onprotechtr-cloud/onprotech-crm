"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { customerSchema } from "@/lib/validations/customer";

export async function getCustomers(search?: string) {
  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { company: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { city: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { quotes: true, appointments: true } },
    },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      quotes: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      appointments: {
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  });
}

export async function createCustomer(data: unknown) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const customer = await prisma.customer.create({
    data: parsed.data,
  });

  revalidatePath("/musteriler");
  return { data: customer };
}

export async function updateCustomer(id: string, data: unknown) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/musteriler");
  revalidatePath(`/musteriler/${id}`);
  return { data: customer };
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/musteriler");
  return { success: true };
}
