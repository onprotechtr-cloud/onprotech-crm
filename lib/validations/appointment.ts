import { z } from "zod";

export const appointmentSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
  customerId: z.string().min(1, "Müşteri seçimi gerekli"),
  date: z.string().min(1, "Tarih gerekli"),
  startTime: z.string().min(1, "Başlangıç saati gerekli"),
  endTime: z.string().min(1, "Bitiş saati gerekli"),
  location: z.string().optional(),
  status: z.enum(["PLANNED", "COMPLETED", "CANCELLED"]).default("PLANNED"),
  notes: z.string().optional(),
  color: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
