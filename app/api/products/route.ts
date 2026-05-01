import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, unit: true, unitPrice: true, stockQuantity: true },
  });
  return NextResponse.json(products);
}
