import { z } from "zod";

export const quoteItemSchema = z.object({
  productName: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Miktar 0'dan büyük olmalı"),
  unit: z.string().default("adet"),
  unitPrice: z.coerce.number().min(0, "Birim fiyat 0 veya üzeri olmalı"),
  total: z.coerce.number().optional(),
  order: z.coerce.number().optional(),
});

export const quoteSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi gerekli"),
  date: z.string().min(1, "Tarih gerekli"),
  validUntil: z.string().min(1, "Geçerlilik tarihi gerekli"),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).default("DRAFT"),
  taxRate: z.coerce.number().min(0).max(100).default(20),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "En az bir ürün satırı ekleyin"),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;
