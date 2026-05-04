"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Quote, QuoteItem } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createQuoteAction, updateQuoteAction } from "@/lib/actions/quote-actions";
import { quoteSchema, type QuoteInput } from "@/lib/validation";
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
import { formatCurrency, getErrorMessage } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
  currency: string;
};

type QuoteFormProps = {
  customers: Array<{ id: string; name: string; company: string | null }>;
  products: Product[];
  userId: string;
  quote?: (Quote & { items: QuoteItem[] }) | null;
};

type LineItem = {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

const emptyLine = (): LineItem => ({
  productName: "",
  description: "",
  quantity: 1,
  unit: "adet",
  unitPrice: 0,
});

export function QuoteForm({ customers, products, userId, quote }: QuoteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<LineItem[]>(
    quote?.items.map((item) => ({
      productName: item.productName,
      description: item.description ?? "",
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
    })) ?? [emptyLine()],
  );

  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerId: quote?.customerId ?? "",
      date: quote
        ? new Date(quote.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      validUntil: quote
        ? new Date(quote.validUntil).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      currency: (quote?.currency as "TRY" | "USD") ?? "TRY",
      taxRate: quote?.taxRate ?? 20,
      discount: quote?.discount ?? 0,
      notes: quote?.notes ?? "",
      items,
    },
  });

  const currency = form.watch("currency") ?? "TRY";
  const taxRate = Number(form.watch("taxRate") ?? 0);
  const discount = Number(form.watch("discount") ?? 0);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, total };
  }, [items, taxRate, discount]);

  const updateLine = (index: number, patch: Partial<LineItem>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const applyProduct = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    updateLine(index, {
      productName: p.name,
      unit: p.unit,
      unitPrice: p.unitPrice,
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("customerId", values.customerId);
        formData.append("date", values.date);
        formData.append("validUntil", values.validUntil);
        formData.append("currency", values.currency ?? "TRY");
        formData.append("taxRate", String(values.taxRate));
        formData.append("discount", String(values.discount));
        formData.append("notes", values.notes ?? "");
        formData.append("items", JSON.stringify(items));

        const result = quote
          ? await updateQuoteAction(quote.id, formData)
          : await createQuoteAction(formData, userId);
        toast.success(result.message);
        router.push(
          quote
            ? `/dashboard/teklifler/${quote.id}`
            : `/dashboard/teklifler/${result.id}`,
        );
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Header fields */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Musteri</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Musteri secin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.company ? ` - ${c.company}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-rose-600">{fieldState.error.message}</p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teklif Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gecerlilik Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Urun Satirlari</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItems((prev) => [...prev, emptyLine()])}
                >
                  <Plus className="h-4 w-4" />
                  Satir Ekle
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  {/* Product picker row */}
                  {products.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <select
                        className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        defaultValue=""
                        onChange={(e) => applyProduct(index, e.target.value)}
                      >
                        <option value="" disabled>
                          Katalogdan urun sec (opsiyonel)
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name} ({formatCurrency(p.unitPrice, p.currency)}/{p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Editable fields */}
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-12">
                    <Input
                      className="xl:col-span-3"
                      placeholder="Urun adi"
                      value={item.productName}
                      onChange={(e) => updateLine(index, { productName: e.target.value })}
                    />
                    <Input
                      className="xl:col-span-3"
                      placeholder="Aciklama"
                      value={item.description}
                      onChange={(e) => updateLine(index, { description: e.target.value })}
                    />
                    <Input
                      className="xl:col-span-1"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Adet"
                      value={item.quantity}
                      onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                    />
                    <Input
                      className="xl:col-span-2"
                      placeholder="Birim"
                      value={item.unit}
                      onChange={(e) => updateLine(index, { unit: e.target.value })}
                    />
                    <Input
                      className="xl:col-span-2"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Birim fiyat"
                      value={item.unitPrice}
                      onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })}
                    />
                    <div className="flex items-center justify-between gap-2 xl:col-span-1">
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                        {formatCurrency(Number(item.quantity) * Number(item.unitPrice), currency)}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={items.length === 1}
                        onClick={() =>
                          setItems((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tax / discount / totals */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KDV (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirim ({currency === "USD" ? "$" : "TL"})</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Ara Toplam</span>
                  <span>{formatCurrency(totals.subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>KDV</span>
                  <span>{formatCurrency(totals.taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Genel Toplam</span>
                  <span>{formatCurrency(totals.total, currency)}</span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button disabled={pending} type="submit">
              {pending
                ? "Kaydediliyor..."
                : quote
                  ? "Teklifi Guncelle"
                  : "Teklifi Olustur"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
