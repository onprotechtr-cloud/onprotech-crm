"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";
import { sendEmail, createNewCustomerEmail } from "@/lib/email";

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

  // Mail bildirimi gönder
  try {
    const emailContent = createNewCustomerEmail({
      customerName: customer.name,
      customerEmail: customer.email || "-",
      customerPhone: customer.phone || "-",
    });

    await sendEmail({
      to: "onprotechtr@gmail.com",
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error("Mail gönderme hatası:", emailError);
  }

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
