"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      type: data.type,
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
    data,
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
  console.log("Session:", session);
  
  if (!session?.user) {
    console.error("No session or user");
    return { error: "Oturum açmanız gerekiyor" };
  }

  const userId = (session.user as { id?: string }).id;
  console.log("User ID:", userId);
  
  if (!userId) {
    console.error("No user ID in session");
    return { error: "Kullanıcı ID bulunamadı" };
  }

  // Check source stock
  const fromStock = await prisma.warehouseStock.findUnique({
    where: {
      warehouseId_productId: {
        warehouseId: data.fromWarehouseId,
        productId: data.productId,
      },
    },
  });

  if (!fromStock || fromStock.quantity < data.quantity) {
    return {
      error: `Yetersiz stok. Mevcut: ${fromStock?.quantity ?? 0}`,
    };
  }

  const transferNumber = await generateTransferNumber();

  const transfer = await prisma.stockTransfer.create({
    data: {
      transferNumber,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      productId: data.productId,
      quantity: data.quantity,
      notes: data.notes || null,
      status: "TAMAMLANDI",
    },
  });

  // Update warehouse stocks
  await prisma.$transaction([
    prisma.warehouseStock.update({
      where: {
        warehouseId_productId: {
          warehouseId: data.fromWarehouseId,
          productId: data.productId,
        },
      },
      data: { quantity: { decrement: data.quantity } },
    }),
    prisma.warehouseStock.upsert({
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
    }),
  ]);

  revalidatePath("/dashboard/depolar");
  revalidatePath("/dashboard/depolar/transfer/gecmis");
  
  // Mail bildirimi gönder
  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { name: true },
    });
    
    const fromWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.fromWarehouseId },
      select: { name: true },
    });
    
    const toWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.toWarehouseId },
      select: { name: true },
    });
    
    if (product && fromWarehouse && toWarehouse) {
      const emailContent = createStockTransferEmail({
        productName: product.name,
        quantity: data.quantity,
        fromWarehouse: fromWarehouse.name,
        toWarehouse: toWarehouse.name,
        transferNumber,
      });
      
      // onprotechtr@gmail.com adresine mail gönder
      await sendEmail({
        to: "onprotechtr@gmail.com",
        subject: emailContent.subject,
        html: emailContent.html,
      });
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
