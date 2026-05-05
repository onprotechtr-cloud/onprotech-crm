"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentSchema } from "@/lib/validations/appointment";
import { sendEmail, createNewAppointmentEmail } from "@/lib/email";

export async function getAppointments(fromDate?: Date, toDate?: Date) {
  return prisma.appointment.findMany({
    where:
      fromDate && toDate
        ? { date: { gte: fromDate, lte: toDate } }
        : undefined,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      customer: { select: { name: true, company: true } },
      user: { select: { name: true } },
    },
  });
}

export async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.appointment.findMany({
    where: {
      date: { gte: today, lt: tomorrow },
    },
    orderBy: { startTime: "asc" },
    include: {
      customer: { select: { name: true, company: true } },
    },
  });
}

export async function getAppointment(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { name: true } },
    },
  });
}

export async function createAppointment(data: unknown) {
  const session = await getServerSession(authOptions);
  console.log("Appointment - Session:", session);
  if (!session?.user) return { error: { auth: ["Oturum açmanız gerekiyor"] } };

  let userId = (session.user as { id?: string }).id;
  console.log("Appointment - Session userId:", userId);
  
  // UserId yoksa admin kullanıcısını bul
  if (!userId) {
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    console.log("Appointment - Admin user:", adminUser);
    userId = adminUser?.id;
  }
  
  if (!userId) return { error: { auth: ["Kullanıcı ID bulunamadı"] } };

  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { date, ...rest } = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      ...rest,
      date: new Date(date),
      userId,
    },
    include: {
      customer: { select: { name: true } },
    },
  });

  // Mail bildirimi gönder
  try {
    if (appointment.customer) {
      const emailContent = createNewAppointmentEmail({
        customerName: appointment.customer.name,
        date: appointment.date.toLocaleDateString('tr-TR'),
        startTime: appointment.startTime,
        title: appointment.title,
      });
      
      await sendEmail({
        to: "onprotechtr@gmail.com",
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  } catch (emailError) {
    console.error("Mail gönderme hatası:", emailError);
  }

  revalidatePath("/randevular");
  revalidatePath("/dashboard");
  return { data: appointment };
}

export async function updateAppointment(id: string, data: unknown) {
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { date, ...rest } = parsed.data;

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...rest,
      date: new Date(date),
    },
  });

  revalidatePath("/randevular");
  revalidatePath("/dashboard");
  return { data: appointment };
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/randevular");
  revalidatePath("/dashboard");
  return { success: true };
}
