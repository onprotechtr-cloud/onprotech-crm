"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveCompanySettings(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const taxNumber = formData.get("taxNumber") as string;
  const taxOffice = formData.get("taxOffice") as string;
  const website = formData.get("website") as string;
  const defaultCurrency = formData.get("defaultCurrency") as string;
  const defaultTaxRate = formData.get("defaultTaxRate") as string;
  const invoicePrefix = formData.get("invoicePrefix") as string;
  const quotePrefix = formData.get("quotePrefix") as string;
  const servicePrefix = formData.get("servicePrefix") as string;

  const existing = await prisma.companySettings.findFirst();

  const data = {
    companyName: companyName || "",
    email: email || "",
    phone: phone || "",
    address: address || "",
    city: city || "",
    taxNumber: taxNumber || "",
    taxOffice: taxOffice || "",
    website: website || "",
    defaultCurrency: defaultCurrency || "TRY",
    defaultTaxRate: defaultTaxRate ? parseFloat(defaultTaxRate) : 18,
    invoicePrefix: invoicePrefix || "INV",
    quotePrefix: quotePrefix || "ONP",
    servicePrefix: servicePrefix || "SRV",
  };

  if (existing) {
    await prisma.companySettings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.companySettings.create({ data });
  }

  revalidatePath("/dashboard/ayarlar");
}
