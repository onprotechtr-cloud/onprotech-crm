"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "En az 2 karakter."),
  code: z.string().min(1, "Kod zorunludur."),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "Birim zorunludur."),
  unitPrice: z.coerce.number().min(0),
  currency: z.enum(["TRY", "USD"]).default("TRY"),
  stockQuantity: z.coerce.number().min(0),
  minStockLevel: z.coerce.number().min(0),
});

type ProductInput = z.infer<typeof schema>;

export function ProductForm({ product }: { product?: Product | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<ProductInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      code: product?.code ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      unit: product?.unit ?? "adet",
      unitPrice: product?.unitPrice ?? 0,
      currency: (product?.currency as "TRY" | "USD") ?? "TRY",
      stockQuantity: product?.stockQuantity ?? 0,
      minStockLevel: product?.minStockLevel ?? 5,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "")));
        const result = product
          ? await updateProductAction(product.id, fd)
          : await createProductAction(fd);
        toast.success(result.message);
        router.push(product ? `/dashboard/stok/${product.id}` : "/dashboard/stok");
        router.refresh();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Urun Adi</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  {fieldState.error && <p className="text-sm text-rose-600">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Urun Kodu</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  {fieldState.error && <p className="text-sm text-rose-600">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Birim</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  {fieldState.error && <p className="text-sm text-rose-600">{fieldState.error.message}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para Birimi</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Para birimi secin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRY">TL (Turk Lirasi)</SelectItem>
                      <SelectItem value="USD">USD (Amerikan Dolari)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birim Fiyat</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mevcut Stok</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stok Seviyesi</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aciklama</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <Button disabled={pending} type="submit">
                {pending ? "Kaydediliyor..." : product ? "Guncelle" : "Urun Olustur"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
