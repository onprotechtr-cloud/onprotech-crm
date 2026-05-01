"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EmployeeStatus, SalaryPeriod, LeaveType, LeaveStatus, AttendanceStatus } from "@prisma/client";

export async function createEmployee(formData: FormData): Promise<void> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const department = formData.get("department") as string;
  const position = formData.get("position") as string;
  const startDate = formData.get("startDate") as string;
  const salary = formData.get("salary") as string;
  const salaryPeriod = formData.get("salaryPeriod") as string;
  const status = formData.get("status") as string;
  const address = formData.get("address") as string;
  const emergencyContact = formData.get("emergencyContact") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;
  const notes = formData.get("notes") as string;

  if (!firstName || !lastName || !department || !position) {
    throw new Error("Ad, soyad, departman ve pozisyon zorunludur.");
  }

  await prisma.employee.create({
    data: {
      firstName,
      lastName,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@temp.local`,
      phone: phone || undefined,
      department,
      position,
      startDate: startDate ? new Date(startDate) : new Date(),
      salary: salary ? parseFloat(salary) : 0,
      salaryPeriod: (salaryPeriod as SalaryPeriod) || SalaryPeriod.AYLIK,
      status: (status as EmployeeStatus) || EmployeeStatus.AKTIF,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
      notes: notes || undefined,
    },
  });

  revalidatePath("/dashboard/personel");
  redirect("/dashboard/personel");
}

export async function updateEmployee(id: string, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const department = formData.get("department") as string;
  const position = formData.get("position") as string;
  const startDate = formData.get("startDate") as string;
  const salary = formData.get("salary") as string;
  const salaryPeriod = formData.get("salaryPeriod") as string;
  const status = formData.get("status") as string;
  const address = formData.get("address") as string;
  const emergencyContact = formData.get("emergencyContact") as string;
  const emergencyPhone = formData.get("emergencyPhone") as string;
  const notes = formData.get("notes") as string;

  await prisma.employee.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
      department,
      position,
      startDate: startDate ? new Date(startDate) : undefined,
      salary: salary ? parseFloat(salary) : undefined,
      salaryPeriod: (salaryPeriod as SalaryPeriod) || SalaryPeriod.AYLIK,
      status: (status as EmployeeStatus) || EmployeeStatus.AKTIF,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
      notes: notes || undefined,
    },
  });

  revalidatePath("/dashboard/personel");
  revalidatePath(`/dashboard/personel/${id}`);
  redirect(`/dashboard/personel/${id}`);
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/dashboard/personel");
  redirect("/dashboard/personel");
}

export async function createLeaveRequest(employeeId: string, formData: FormData): Promise<void> {
  const type = formData.get("type") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const totalDays = formData.get("totalDays") as string;
  const reason = formData.get("reason") as string;

  if (!type || !startDate || !endDate || !totalDays) {
    throw new Error("Tüm zorunlu alanları doldurun.");
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId,
      type: type as LeaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: parseInt(totalDays),
      status: LeaveStatus.BEKLEMEDE,
      reason: reason || null,
    },
  });

  revalidatePath(`/dashboard/personel/${employeeId}`);
}

export async function updateLeaveStatus(
  id: string,
  status: "ONAYLANDI" | "REDDEDILDI",
  approverId: string
): Promise<void> {
  await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: status as LeaveStatus,
      approvedById: approverId,
    },
  });

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (leave) {
    revalidatePath(`/dashboard/personel/${leave.employeeId}`);
  }
  revalidatePath("/dashboard/personel");
}

export async function createAttendance(employeeId: string, formData: FormData): Promise<void> {
  const date = formData.get("date") as string;
  const checkIn = formData.get("checkIn") as string;
  const checkOut = formData.get("checkOut") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  if (!date) {
    throw new Error("Tarih zorunludur.");
  }

  let totalHours: number | null = null;
  if (checkIn && checkOut) {
    const [inH, inM] = checkIn.split(":").map(Number);
    const [outH, outM] = checkOut.split(":").map(Number);
    totalHours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
    if (totalHours < 0) totalHours = null;
  }

  await prisma.attendance.create({
    data: {
      employeeId,
      date: new Date(date),
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      totalHours,
      status: (status as AttendanceStatus) || AttendanceStatus.NORMAL,
      notes: notes || null,
    },
  });

  revalidatePath(`/dashboard/personel/${employeeId}`);
}
