"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountType, TransactionType } from "@prisma/client";

export async function getCashAccounts() {
  return prisma.cashAccount.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { transactions: true } } },
  });
}

export async function getCashAccountById(id: string) {
  return prisma.cashAccount.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        include: {
          invoice: { select: { invoiceNumber: true } },
          subscription: { select: { planName: true } },
        },
      },
    },
  });
}

export async function getDashboardCashStats() {
  const accounts = await prisma.cashAccount.findMany({ where: { isActive: true } });
  const totalKasa = accounts.filter(a => a.type === "KASA").reduce((s, a) => s + a.balance, 0);
  const totalBanka = accounts.filter(a => a.type === "BANKA").reduce((s, a) => s + a.balance, 0);

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [todayIncome, todayExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: TransactionType.GELIR, date: { gte: startOfDay, lte: endOfDay } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: TransactionType.GIDER, date: { gte: startOfDay, lte: endOfDay } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalKasa,
    totalBanka,
    todayIncome: todayIncome._sum.amount ?? 0,
    todayExpense: todayExpense._sum.amount ?? 0,
  };
}

export interface CreateAccountInput {
  name: string;
  type: "KASA" | "BANKA";
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  currency: "TRY" | "USD";
  balance: number;
}

export async function createCashAccount(data: CreateAccountInput) {
  const account = await prisma.cashAccount.create({
    data: {
      ...data,
      type: data.type as AccountType,
    },
  });
  revalidatePath("/dashboard/kasa-banka");
  return { data: account };
}

export async function updateCashAccount(id: string, data: CreateAccountInput) {
  const account = await prisma.cashAccount.update({
    where: { id },
    data: {
      ...data,
      type: data.type as AccountType,
    },
  });
  revalidatePath("/dashboard/kasa-banka");
  return { data: account };
}

export interface CreateTransactionInput {
  accountId: string;
  type: "GELIR" | "GIDER";
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  relatedInvoiceId?: string;
  relatedSubscriptionId?: string;
}

export async function createTransaction(data: CreateTransactionInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id ?? "";

  const tx = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        accountId: data.accountId,
        type: data.type as TransactionType,
        category: data.category,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.date),
        relatedInvoiceId: data.relatedInvoiceId || null,
        relatedSubscriptionId: data.relatedSubscriptionId || null,
        createdBy: userId,
      },
    });

    // Update account balance
    const delta = data.type === "GELIR" ? data.amount : -data.amount;
    await tx.cashAccount.update({
      where: { id: data.accountId },
      data: { balance: { increment: delta } },
    });

    return transaction;
  });

  revalidatePath("/dashboard/kasa-banka");
  revalidatePath(`/dashboard/kasa-banka/${data.accountId}`);
  return { data: tx };
}
