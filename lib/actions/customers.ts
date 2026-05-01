"use server";

import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function createCustomerAction(data: FormData) {
  const parsed = customerSchema.parse({
    name: data.get("name"),
    company: data.get("company"),
    email: data.get("email"),
    phone: data.get("phone"),
    address: data.get("address"),
    city: data.get("city"),
    notes: data.get("notes"),
  });

  await prisma.customer.create({ data: parsed });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/musteriler");

  return { success: true, message: "Müşteri başarıyla oluşturuldu." };
}

export async function updateCustomerAction(id: string, data: FormData) {
  const parsed = customerSchema.parse({
    name: data.get("name"),
    company: data.get("company"),
    email: data.get("email"),
    phone: data.get("phone"),
    address: data.get("address"),
    city: data.get("city"),
    notes: data.get("notes"),
  });

  await prisma.customer.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/dashboard/musteriler");
  revalidatePath(`/dashboard/musteriler/${id}`);

  return { success: true, message: "Müşteri bilgileri güncellendi." };
}

export async function deleteCustomerAction(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/dashboard/musteriler");
  revalidatePath("/dashboard");
  return { success: true, message: "Müşteri silindi." };
}