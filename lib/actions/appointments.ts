"use server";

import { revalidatePath } from "next/cache";
import { appointmentSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getAppointmentColor } from "@/lib/utils";

export async function createAppointmentAction(data: FormData, userId: string) {
  const parsed = appointmentSchema.parse({
    title: data.get("title"),
    customerId: data.get("customerId"),
    date: data.get("date"),
    startTime: data.get("startTime"),
    endTime: data.get("endTime"),
    location: data.get("location"),
    notes: data.get("notes"),
    status: data.get("status"),
  });

  await prisma.appointment.create({
    data: {
      ...parsed,
      userId,
      date: new Date(parsed.date),
      color: getAppointmentColor(parsed.status),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/randevular");

  return { success: true, message: "Randevu oluşturuldu." };
}

export async function updateAppointmentAction(id: string, data: FormData) {
  const parsed = appointmentSchema.parse({
    title: data.get("title"),
    customerId: data.get("customerId"),
    date: data.get("date"),
    startTime: data.get("startTime"),
    endTime: data.get("endTime"),
    location: data.get("location"),
    notes: data.get("notes"),
    status: data.get("status"),
  });

  await prisma.appointment.update({
    where: { id },
    data: {
      ...parsed,
      date: new Date(parsed.date),
      color: getAppointmentColor(parsed.status),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/randevular");

  return { success: true, message: "Randevu güncellendi." };
}