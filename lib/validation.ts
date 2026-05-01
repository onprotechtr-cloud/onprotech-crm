import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  company: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin.").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır.").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export const quoteItemSchema = z.object({
  productName: z.string().min(1, "Ürün adı zorunludur."),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Miktar sıfırdan büyük olmalıdır."),
  unit: z.string().min(1, "Birim zorunludur."),
  unitPrice: z.coerce.number().min(0, "Birim fiyat negatif olamaz."),
});

export const quoteSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçin."),
  date: z.string().min(1, "Tarih seçin."),
  validUntil: z.string().min(1, "Geçerlilik tarihi seçin."),
  currency: z.enum(["TRY", "USD"]).default("TRY"),
  taxRate: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "En az bir ürün ekleyin."),
});

export const appointmentSchema = z.object({
  title: z.string().min(2, "Başlık zorunludur."),
  customerId: z.string().min(1, "Müşteri seçin."),
  date: z.string().min(1, "Tarih seçin."),
  startTime: z.string().min(1, "Başlangıç saati seçin."),
  endTime: z.string().min(1, "Bitiş saati seçin."),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELLED"]).default("PLANNED"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;