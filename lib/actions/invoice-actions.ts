"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, InvoiceType } from "@prisma/client";

export async function getInvoices(status?: string) {
  return prisma.invoice.findMany({
    where: status && status !== "ALL" ? { status: status as InvoiceStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, company: true } },
      user: { select: { name: true } },
    },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { name: true, email: true } },
      items: { orderBy: { order: "asc" } },
      transactions: { orderBy: { date: "desc" } },
    },
  });
}

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `FTR-${year}-` } },
  });
  return `FTR-${year}-${String(count + 1).padStart(3, "0")}`;
}

export interface InvoiceItemInput {
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate?: number;
}

export interface CreateInvoiceInput {
  customerId: string;
  type: "SATIS" | "ALIS";
  date: string;
  dueDate: string;
  currency: "TRY" | "USD";
  taxRate: number;
  discount: number;
  notes?: string;
  items: InvoiceItemInput[];
  sourceQuoteId?: string;
}

function calcTotals(items: InvoiceItemInput[], taxRate: number, discount: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export async function createInvoice(data: CreateInvoiceInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id;
  if (!userId) return { error: "Kullanıcı ID bulunamadı" };

  const { items, date, dueDate, taxRate, discount, ...rest } = data;
  const { subtotal, taxAmount, total } = calcTotals(items, taxRate, discount);
  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      invoiceNumber,
      userId,
      type: rest.type as InvoiceType,
      date: new Date(date),
      dueDate: new Date(dueDate),
      taxRate,
      discount,
      subtotal,
      taxAmount,
      total,
      paidAmount: 0,
      remainingAmount: total,
      items: {
        create: items.map((item, idx) => ({
          productName: item.productName,
          description: item.description ?? "",
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate ?? taxRate,
          total: Math.round(item.quantity * item.unitPrice * 100) / 100,
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard/faturalar");
  return { data: invoice };
}

export async function updateInvoice(id: string, data: CreateInvoiceInput) {
  const { items, date, dueDate, taxRate, discount, ...rest } = data;
  const { subtotal, taxAmount, total } = calcTotals(items, taxRate, discount);

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...rest,
      type: rest.type as InvoiceType,
      date: new Date(date),
      dueDate: new Date(dueDate),
      taxRate,
      discount,
      subtotal,
      taxAmount,
      total,
      remainingAmount: total,
      items: {
        deleteMany: {},
        create: items.map((item, idx) => ({
          productName: item.productName,
          description: item.description ?? "",
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate ?? taxRate,
          total: Math.round(item.quantity * item.unitPrice * 100) / 100,
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard/faturalar");
  revalidatePath(`/dashboard/faturalar/${id}`);
  return { data: invoice };
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const invoice = await prisma.invoice.findUnique({ where: { id }, select: { total: true } });
  const updateData: Record<string, unknown> = { status };
  if (status === InvoiceStatus.ODENDI && invoice) {
    updateData.paidAmount = invoice.total;
    updateData.remainingAmount = 0;
  }
  await prisma.invoice.update({ where: { id }, data: updateData });
  revalidatePath("/dashboard/faturalar");
  revalidatePath(`/dashboard/faturalar/${id}`);
  return { success: true };
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/dashboard/faturalar");
  return { success: true };
}

export async function convertQuoteToInvoice(quoteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };
  const userId = (session.user as { id?: string }).id;
  if (!userId) return { error: "Kullanıcı ID bulunamadı" };

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!quote) return { error: "Teklif bulunamadı" };

  const invoiceNumber = await generateInvoiceNumber();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: quote.customerId,
      userId,
      type: InvoiceType.SATIS,
      date: new Date(),
      dueDate,
      status: InvoiceStatus.TASLAK,
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      discount: quote.discount,
      total: quote.total,
      paidAmount: 0,
      remainingAmount: quote.total,
      notes: quote.notes,
      sourceQuoteId: quoteId,
      items: {
        create: quote.items.map((item, idx) => ({
          productName: item.productName,
          description: item.description ?? "",
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: quote.taxRate,
          total: item.total,
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard/faturalar");
  revalidatePath(`/dashboard/teklifler/${quoteId}`);
  return { data: invoice };
}
