"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseStatus, PaymentMethod } from "@prisma/client";

export async function getExpenses(categoryId?: string, status?: string) {
  return prisma.expense.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(status && status !== "ALL" ? { status: status as ExpenseStatus } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      category: true,
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
    },
  });
}

export async function getExpenseCategories() {
  return prisma.expenseCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getMonthlyExpenseSummary() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const [monthlyTotal, pendingCount, byCategory] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        status: ExpenseStatus.ONAYLANDI,
      },
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: { status: ExpenseStatus.BEKLEMEDE } }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
        status: ExpenseStatus.ONAYLANDI,
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    monthlyTotal: monthlyTotal._sum.amount ?? 0,
    pendingCount,
    byCategory,
  };
}

export interface CreateExpenseInput {
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  receipt?: string;
}

export async function createExpense(data: CreateExpenseInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id;
  if (!userId) return { error: "Kullanıcı ID bulunamadı" };

  const expense = await prisma.expense.create({
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      date: new Date(data.date),
      paymentMethod: data.paymentMethod as PaymentMethod,
      receipt: data.receipt,
      status: ExpenseStatus.BEKLEMEDE,
      createdById: userId,
    },
  });

  revalidatePath("/dashboard/masraflar");
  return { data: expense };
}

export async function updateExpense(id: string, data: CreateExpenseInput) {
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      date: new Date(data.date),
      paymentMethod: data.paymentMethod as PaymentMethod,
      receipt: data.receipt,
    },
  });

  revalidatePath("/dashboard/masraflar");
  revalidatePath(`/dashboard/masraflar/${id}`);
  return { data: expense };
}

export async function approveExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id;

  await prisma.expense.update({
    where: { id },
    data: { status: ExpenseStatus.ONAYLANDI, approvedById: userId },
  });

  revalidatePath("/dashboard/masraflar");
  revalidatePath(`/dashboard/masraflar/${id}`);
  return { success: true };
}

export async function rejectExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id;

  await prisma.expense.update({
    where: { id },
    data: { status: ExpenseStatus.REDDEDILDI, approvedById: userId },
  });

  revalidatePath("/dashboard/masraflar");
  revalidatePath(`/dashboard/masraflar/${id}`);
  return { success: true };
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/dashboard/masraflar");
  return { success: true };
}

export async function createExpenseCategory(name: string, description?: string) {
  const cat = await prisma.expenseCategory.create({ data: { name, description } });
  revalidatePath("/dashboard/masraflar");
  return { data: cat };
}
