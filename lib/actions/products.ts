"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(2, "Urun adi en az 2 karakter olmalidir."),
  code: z.string().min(1, "Urun kodu zorunludur."),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "Birim zorunludur."),
  unitPrice: z.coerce.number().min(0, "Birim fiyat negatif olamaz."),
  currency: z.enum(["TRY", "USD"]).default("TRY"),
  stockQuantity: z.coerce.number().min(0, "Stok miktari negatif olamaz."),
  minStockLevel: z.coerce.number().min(0, "Minimum stok seviyesi negatif olamaz."),
});

function parseForm(data: FormData) {
  return productSchema.parse({
    name: data.get("name"),
    code: data.get("code"),
    description: data.get("description"),
    category: data.get("category"),
    unit: data.get("unit"),
    unitPrice: data.get("unitPrice"),
    currency: data.get("currency") || "TRY",
    stockQuantity: data.get("stockQuantity"),
    minStockLevel: data.get("minStockLevel"),
  });
}

export async function createProductAction(data: FormData) {
  const parsed = parseForm(data);
  
  // Merkez Depo'yu bul
  const merkezDepo = await prisma.warehouse.findFirst({
    where: { name: { contains: "Merkez", mode: "insensitive" } },
  });
  
  if (merkezDepo) {
    // Ürünü Merkez Depo'ya bağlı olarak oluştur
    await prisma.product.create({
      data: {
        ...parsed,
        warehouseStocks: {
          create: {
            warehouseId: merkezDepo.id,
            quantity: parsed.stockQuantity,
          },
        },
      },
    });
  } else {
    // Merkez Depo bulunamazsa sadece ürünü oluştur
    await prisma.product.create({ data: parsed });
  }
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stok");
  return { success: true, message: "Urun basariyla olusturuldu." };
}

export async function updateProductAction(id: string, data: FormData) {
  const parsed = parseForm(data);
  await prisma.product.update({ where: { id }, data: parsed });
  revalidatePath("/dashboard/stok");
  revalidatePath(`/dashboard/stok/${id}`);
  return { success: true, message: "Urun guncellendi." };
}

export async function deleteProductAction(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/dashboard/stok");
  revalidatePath("/dashboard");
  return { success: true, message: "Urun silindi." };
}
