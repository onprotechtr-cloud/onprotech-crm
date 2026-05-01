"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function createUser(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  const isActiveVal = formData.get("isActive");

  if (!name || !email || !password) {
    throw new Error("Ad, e-posta ve şifre zorunludur.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Bu e-posta adresi zaten kullanılıyor.");
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: (role as UserRole) || UserRole.SATIS,
      phone: phone || undefined,
      isActive: isActiveVal === "on" || isActiveVal === "true" || isActiveVal === "1",
    },
  });

  revalidatePath("/dashboard/kullanicilar");
  redirect("/dashboard/kullanicilar");
}

export async function updateUser(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  const isActiveVal = formData.get("isActive");

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role: (role as UserRole) || UserRole.SATIS,
      phone: phone || undefined,
      isActive: isActiveVal === "on" || isActiveVal === "true" || isActiveVal === "1",
    },
  });

  revalidatePath("/dashboard/kullanicilar");
  revalidatePath(`/dashboard/kullanicilar/${id}/duzenle`);
  redirect("/dashboard/kullanicilar");
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/dashboard/kullanicilar");
}

export async function resetUserPassword(id: string, formData: FormData): Promise<void> {
  const newPassword = formData.get("newPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalıdır.");
  }

  const hashedPassword = await hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  revalidatePath(`/dashboard/kullanicilar/${id}/duzenle`);
}
