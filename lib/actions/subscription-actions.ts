"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus, SubscriptionStatus, SubscriptionType } from "@prisma/client";

export async function getSubscriptions(status?: string) {
  return prisma.subscription.findMany({
    where: status && status !== "ALL" ? { status: status as SubscriptionStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, company: true } },
      _count: { select: { payments: true } },
    },
  });
}

export async function getSubscriptionById(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
}

export async function getExpiringSubscriptions() {
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86400000);
  return prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.AKTIF,
      endDate: { gte: today, lte: in30 },
    },
    include: { customer: { select: { name: true, company: true } } },
    orderBy: { endDate: "asc" },
  });
}

export interface CreateSubscriptionInput {
  customerId: string;
  planName: string;
  description?: string;
  type: "AYLIK" | "YILLIK";
  amount: number;
  currency: "TRY" | "USD";
  startDate: string;
  autoRenew: boolean;
  notes?: string;
}

function calcEndDate(startDate: Date, type: "AYLIK" | "YILLIK"): Date {
  const end = new Date(startDate);
  if (type === "YILLIK") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

export async function createSubscription(data: CreateSubscriptionInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };

  const startDate = new Date(data.startDate);
  const endDate = calcEndDate(startDate, data.type);
  const nextBillingDate = new Date(endDate);

  const sub = await prisma.subscription.create({
    data: {
      customerId: data.customerId,
      planName: data.planName,
      description: data.description,
      type: data.type as SubscriptionType,
      amount: data.amount,
      currency: data.currency,
      startDate,
      endDate,
      nextBillingDate,
      status: SubscriptionStatus.AKTIF,
      autoRenew: data.autoRenew,
      notes: data.notes,
    },
  });

  revalidatePath("/dashboard/abonelikler");
  return { data: sub };
}

export async function updateSubscription(id: string, data: CreateSubscriptionInput) {
  const startDate = new Date(data.startDate);
  const endDate = calcEndDate(startDate, data.type);
  const nextBillingDate = new Date(endDate);

  const sub = await prisma.subscription.update({
    where: { id },
    data: {
      customerId: data.customerId,
      planName: data.planName,
      description: data.description,
      type: data.type as SubscriptionType,
      amount: data.amount,
      currency: data.currency,
      startDate,
      endDate,
      nextBillingDate,
      autoRenew: data.autoRenew,
      notes: data.notes,
    },
  });

  revalidatePath("/dashboard/abonelikler");
  revalidatePath(`/dashboard/abonelikler/${id}`);
  return { data: sub };
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
  await prisma.subscription.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/abonelikler");
  revalidatePath(`/dashboard/abonelikler/${id}`);
  return { success: true };
}

export async function addSubscriptionPayment(subscriptionId: string, input: {
  amount: number;
  currency: string;
  paymentDate: string;
  status: string;
  method: string;
  notes?: string;
}) {
  await prisma.subscriptionPayment.create({
    data: {
      subscriptionId,
      amount: input.amount,
      currency: input.currency,
      paymentDate: new Date(input.paymentDate),
      status: input.status as PaymentStatus,
      method: input.method as PaymentMethod,
      notes: input.notes,
    },
  });
  revalidatePath(`/dashboard/abonelikler/${subscriptionId}`);
  return { success: true };
}

export async function deleteSubscription(id: string) {
  await prisma.subscription.delete({ where: { id } });
  revalidatePath("/dashboard/abonelikler");
  return { success: true };
}
