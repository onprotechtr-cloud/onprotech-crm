"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { quoteSchema } from "@/lib/validations/quote";
import { generateQuoteNumber } from "@/lib/quote-number";
import { calculateQuoteTotals, roundMoney } from "@/lib/utils";
import { sendEmail, createNewQuoteEmail } from "@/lib/email";

export async function getQuotes(status?: string) {
  return prisma.quote.findMany({
    where: status ? { status: status as "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, company: true } },
      user: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { name: true, email: true } },
      items: { orderBy: { order: "asc" } },
    },
  });
}

export async function createQuoteAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: { auth: ["Oturum açmanız gerekiyor"] } };

  const userId = (session.user as { id?: string }).id;
  if (!userId) return { error: { auth: ["Kullanıcı ID bulunamadı"] } };

  // FormData'dan değerleri al
  const customerId = formData.get("customerId") as string;
  const date = formData.get("date") as string;
  const validUntil = formData.get("validUntil") as string;
  const currency = formData.get("currency") as string;
  const taxRate = Number(formData.get("taxRate"));
  const discount = Number(formData.get("discount"));
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;
  
  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: { items: ["Geçersiz ürün listesi"] } };
  }

  const data = { customerId, date, validUntil, currency, taxRate, discount, notes, items };
  
  const parsed = quoteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { subtotal, taxAmount, total } = calculateQuoteTotals(items, taxRate, discount);
  const quoteNumber = await generateQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      ...rest,
      quoteNumber,
      userId,
      date: new Date(date),
      validUntil: new Date(validUntil),
      taxRate,
      discount,
      subtotal,
      taxAmount,
      total,
      items: {
        create: items.map((item, idx) => ({
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: roundMoney(item.quantity * item.unitPrice),
          order: idx + 1,
        })),
      },
    },
    include: { items: { orderBy: { order: "asc" } } },
  });

  revalidatePath("/teklifler");
  
  // Mail bildirimi gönder
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: rest.customerId },
      select: { name: true },
    });
    
    if (customer) {
      const emailContent = createNewQuoteEmail({
        quoteNumber,
        customerName: customer.name,
        total,
        currency: rest.currency,
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
  
  return { data: quote };
}

export async function updateQuoteAction(id: string, data: unknown) {
  const parsed = quoteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { items, date, validUntil, taxRate, discount, ...rest } = parsed.data;

  const { subtotal, taxAmount, total } = calculateQuoteTotals(items, taxRate, discount);

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...rest,
      date: new Date(date),
      validUntil: new Date(validUntil),
      taxRate,
      discount,
      subtotal,
      taxAmount,
      total,
      items: {
        deleteMany: {},
        create: items.map((item, idx) => ({
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: roundMoney(item.quantity * item.unitPrice),
          order: idx + 1,
        })),
      },
    },
    include: { items: { orderBy: { order: "asc" } } },
  });

  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${id}`);
  return { data: quote };
}

export async function updateQuoteStatus(
  id: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED"
) {
  await prisma.quote.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${id}`);
  return { success: true };
}

export async function deleteQuote(id: string) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/teklifler");
  return { success: true };
}
