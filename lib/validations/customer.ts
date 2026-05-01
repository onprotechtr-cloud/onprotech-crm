import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  company: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
