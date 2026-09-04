"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WarehouseType } from "@prisma/client";
import { sendEmail, createStockTransferEmail } from "@/lib/email";

export async function getWarehouses() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      stocks: {
        include: { product: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return warehouses;
}

export async function getWarehouseById(id: string) {
  return prisma.warehouse.findUnique({
    where: { id },
    include: {
      stocks: {
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      },
    },
  });
}

export async function createWarehouse(data: {
  name: string;
  type: string;
  description?: string;
  address?: string;
  responsible?: string;
}) {
  const warehouse = await prisma.warehouse.create({
    data: {
      name: data.name,
      type: data.type as WarehouseType,
      description: data.description || null,
      address: data.address || null,
      responsible: data.responsible || null,
    },
  });

  revalidatePath("/dashboard/depolar");
  return { data: warehouse };
}

export async function updateWarehouse(
  id: string,
  data: {
    name?: string;
    type?: string;
    description?: string;
    address?: string;
    responsible?: string;
    isActive?: boolean;
  }
) {
  const warehouse = await prisma.warehouse.update({
    where: { id },
    data: {
      ...data,
      type: data.type ? (data.type as WarehouseType) : undefined,
    },
  });

  revalidatePath("/dashboard/depolar");
  revalidatePath(`/dashboard/depolar/${id}`);
  return { data: warehouse };
}

async function generateTransferNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.stockTransfer.count({
    where: { transferNumber: { startsWith: `TRN-${year}-` } },
  });
  return `TRN-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createStockTransfer(data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Oturum açmanız gerekiyor" };
  }

  const userId = (session.user as { id?: string }).id;
  const userName = session.user.name || (session.user as { email?: string }).email || "Kullanıcı";
  
  if (!userId) {
    return { error: "Kullanıcı ID bulunamadı" };
  }

  if (data.fromWarehouseId === data.toWarehouseId) {
    return { error: "Kaynak ve hedef depo aynı olamaz" };
  }

  if (data.quantity <= 0) {
    return { error: "Transfer miktarı 0'dan büyük olmalıdır" };
  }

  const transferNumber = await generateTransferNumber();

  let transfer;
  try {
    // Prisma transaction içinde hem stok düşümü hem de stok eklemesi ve transfer kaydı yapılıyor
    transfer = await prisma.$transaction(async (tx) => {
      // 1. Kaynak depo stoğunu kontrol et
      const fromStock = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: data.fromWarehouseId,
            productId: data.productId,
          },
        },
      });

      if (!fromStock || fromStock.quantity < data.quantity) {
        throw new Error(`Yetersiz stok. Mevcut: ${fromStock?.quantity ?? 0}`);
      }

      // 2. Kaynak depodan stok düş
      await tx.warehouseStock.update({
        where: {
          warehouseId_productId: {
            warehouseId: data.fromWarehouseId,
            productId: data.productId,
          },
        },
        data: { quantity: { decrement: data.quantity } },
      });

      // 3. Hedef depoya stok ekle (varsa artır, yoksa oluştur)
      await tx.warehouseStock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: data.toWarehouseId,
            productId: data.productId,
          },
        },
        update: { quantity: { increment: data.quantity } },
        create: {
          warehouseId: data.toWarehouseId,
          productId: data.productId,
          quantity: data.quantity,
        },
      });

      // 4. Transfer kaydı oluştur
      const newTransfer = await tx.stockTransfer.create({
        data: {
          transferNumber,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          productId: data.productId,
          quantity: data.quantity,
          notes: data.notes || null,
          status: "TAMAMLANDI",
          createdById: userId,
        },
      });

      return newTransfer;
    });
  } catch (err: any) {
    console.error("Stok transfer hatası:", err);
    return { error: err.message || "Transfer işlemi başarısız oldu" };
  }

  revalidatePath("/dashboard/depolar");
  revalidatePath("/dashboard/depolar/transfer/gecmis");
  
  // Mail bildirimi gönder (kaynak ve hedef depo sorumlularına)
  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { name: true, code: true, unit: true },
    });
    
    const fromWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.fromWarehouseId },
      select: { name: true, responsible: true },
    });
    
    const toWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.toWarehouseId },
      select: { name: true, responsible: true },
    });

    const executorUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const executorName = executorUser?.name || userName;
    
    if (product && fromWarehouse && toWarehouse) {
      const emailContent = createStockTransferEmail({
        productName: product.name,
        productCode: product.code,
        quantity: data.quantity,
        unit: product.unit,
        fromWarehouse: fromWarehouse.name,
        toWarehouse: toWarehouse.name,
        transferNumber,
        createdBy: executorName,
        date: new Date().toLocaleString("tr-TR"),
      });

      // Sorumlu kişilerin mail adreslerini tespit et
      const findEmailForResponsible = async (respStr: string | null | undefined) => {
        if (!respStr) return null;
        const trimmed = respStr.trim();
        if (trimmed.includes("@")) return trimmed;

        // User tablosunda isme göre ara
        const userMatch = await prisma.user.findFirst({
          where: { name: { equals: trimmed, mode: "insensitive" } },
          select: { email: true },
        });
        if (userMatch?.email) return userMatch.email;

        // Employee tablosunda e-posta/isme göre ara
        const employeeMatch = await prisma.employee.findFirst({
          where: {
            OR: [
              { email: { equals: trimmed, mode: "insensitive" } },
              { firstName: { contains: trimmed, mode: "insensitive" } },
              { lastName: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          select: { email: true },
        });
        if (employeeMatch?.email) return employeeMatch.email;

        return null;
      };

      const recipientEmails = new Set<string>();

      const fromRespEmail = await findEmailForResponsible(fromWarehouse.responsible);
      if (fromRespEmail) recipientEmails.add(fromRespEmail);

      const toRespEmail = await findEmailForResponsible(toWarehouse.responsible);
      if (toRespEmail) recipientEmails.add(toRespEmail);

      // Genel bildirim adresi de eklenir
      recipientEmails.add("onprotechtr@gmail.com");

      if (recipientEmails.size > 0) {
        await sendEmail({
          to: Array.from(recipientEmails),
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    }
  } catch (emailError) {
    console.error("Mail gönderme hatası:", emailError);
    // Mail hatası transferi engellemesin
  }
  
  return { data: transfer };
}

export async function getStockTransfers(filters?: {
  warehouseId?: string;
  productId?: string;
  status?: string;
}) {
  return prisma.stockTransfer.findMany({
    where: {
      ...(filters?.warehouseId
        ? {
            OR: [
              { fromWarehouseId: filters.warehouseId },
              { toWarehouseId: filters.warehouseId },
            ],
          }
        : {}),
      ...(filters?.productId ? { productId: filters.productId } : {}),
      ...(filters?.status && filters.status !== "ALL"
        ? { status: filters.status }
        : {}),
    },
    include: {
      fromWarehouse: { select: { id: true, name: true } },
      toWarehouse: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, code: true, unit: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWarehouseSummary() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      stocks: {
        include: { product: { select: { minStockLevel: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return warehouses.map((w) => ({
    id: w.id,
    name: w.name,
    type: w.type,
    totalItems: w.stocks.reduce((sum, s) => sum + s.quantity, 0),
    lowStockCount: w.stocks.filter((s) => s.quantity <= s.product.minStockLevel).length,
    productCount: w.stocks.length,
  }));
}
