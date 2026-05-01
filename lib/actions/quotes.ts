"use server";

import { QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { quoteSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getQuoteNumber } from "@/lib/data";

function parseItems(payload: FormDataEntryValue | null) {
  if (!payload || typeof payload !== "string") {
    return [];
  }

  return JSON.parse(payload) as Array<{
    productName: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
}

export async function createQuoteAction(data: FormData, userId: string) {
  const items = parseItems(data.get("items"));
  const currency = (data.get("currency") as string) || "TRY";
  const parsed = quoteSchema.parse({
    customerId: data.get("customerId"),
    date: data.get("date"),
    validUntil: data.get("validUntil"),
    currency,
    taxRate: data.get("taxRate"),
    discount: data.get("discount"),
    notes: data.get("notes"),
    items,
  });

  const subtotal = parsed.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (parsed.taxRate / 100);
  const total = subtotal + taxAmount - parsed.discount;

  const quoteNumber = await getQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      customerId: parsed.customerId,
      userId,
      date: new Date(parsed.date),
      validUntil: new Date(parsed.validUntil),
      status: QuoteStatus.DRAFT,
      currency: parsed.currency,
      subtotal,
      taxRate: parsed.taxRate,
      taxAmount,
      discount: parsed.discount,
      total,
      notes: parsed.notes,
      items: {
        create: parsed.items.map((item, index) => ({
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          currency: parsed.currency,
          total: item.quantity * item.unitPrice,
          order: index + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/teklifler");
  revalidatePath(`/dashboard/teklifler/${quote.id}`);

  return { success: true, message: "Teklif oluşturuldu.", id: quote.id };
}

export async function updateQuoteAction(id: string, data: FormData) {
  const items = parseItems(data.get("items"));
  const currency = (data.get("currency") as string) || "TRY";
  const parsed = quoteSchema.parse({
    customerId: data.get("customerId"),
    date: data.get("date"),
    validUntil: data.get("validUntil"),
    currency,
    taxRate: data.get("taxRate"),
    discount: data.get("discount"),
    notes: data.get("notes"),
    items,
  });

  const subtotal = parsed.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (parsed.taxRate / 100);
  const total = subtotal + taxAmount - parsed.discount;

  await prisma.quote.update({
    where: { id },
    data: {
      customerId: parsed.customerId,
      date: new Date(parsed.date),
      validUntil: new Date(parsed.validUntil),
      currency: parsed.currency,
      subtotal,
      taxRate: parsed.taxRate,
      taxAmount,
      discount: parsed.discount,
      total,
      notes: parsed.notes,
      items: {
        deleteMany: {},
        create: parsed.items.map((item, index) => ({
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          currency: parsed.currency,
          total: item.quantity * item.unitPrice,
          order: index + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/teklifler");
  revalidatePath(`/dashboard/teklifler/${id}`);

  return { success: true, message: "Teklif güncellendi.", id };
}

export async function updateQuoteStatusAction(id: string, status: QuoteStatus) {
  await prisma.quote.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/teklifler");
  revalidatePath(`/dashboard/teklifler/${id}`);

  return { success: true, message: "Teklif durumu güncellendi." };
}
