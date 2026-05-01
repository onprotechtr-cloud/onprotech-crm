"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createInvoice, updateInvoice, type CreateInvoiceInput, type InvoiceItemInput } from "@/lib/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type Customer = { id: string; name: string; company: string | null };

type InvoiceFormProps = {
  customers: Customer[];
  userId: string;
  invoice?: {
    id: string;
    customerId: string;
    type: string;
    date: Date;
    dueDate: Date;
    currency: string;
    taxRate: number;
    discount: number;
    notes: string | null;
    items: Array<{
      productName: string;
      description: string | null;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;
  } | null;
  defaultFromQuote?: {
    customerId: string;
    currency: string;
    taxRate: number;
    discount: number;
    notes: string | null;
    items: Array<{
      productName: string;
      description: string | null;
      quantity: number;
      unit: string;
      unitPrice: number;
    }>;
  } | null;
};

type LineItem = {
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

const emptyLine = (): LineItem => ({ productName: "", description: "", quantity: 1, unit: "adet", unitPrice: 0 });

export function InvoiceForm({ customers, invoice, defaultFromQuote }: InvoiceFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const src = invoice ?? defaultFromQuote;
  const [customerId, setCustomerId] = useState(src?.customerId ?? "");
  const [type, setType] = useState(invoice?.type ?? "SATIS");
  const [date, setDate] = useState(invoice ? new Date(invoice.date).toISOString().slice(0, 10) : today);
  const [dueDate, setDueDate] = useState(invoice ? new Date(invoice.dueDate).toISOString().slice(0, 10) : in30);
  const [currency, setCurrency] = useState<"TRY" | "USD">((src?.currency as "TRY" | "USD") ?? "TRY");
  const [taxRate, setTaxRate] = useState(src?.taxRate ?? 20);
  const [discount, setDiscount] = useState(src?.discount ?? 0);
  const [notes, setNotes] = useState(src?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    src?.items.map((i) => ({
      productName: i.productName,
      description: i.description ?? "",
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
    })) ?? [emptyLine()]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
    const taxAmount = subtotal * (Number(taxRate) / 100);
    const total = subtotal + taxAmount - Number(discount);
    return { subtotal, taxAmount, total };
  }, [items, taxRate, discount]);

  const updateLine = (idx: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error("Müşteri seçiniz"); return; }
    startTransition(async () => {
      const data: CreateInvoiceInput = {
        customerId,
        type: type as "SATIS" | "ALIS",
        date,
        dueDate,
        currency,
        taxRate: Number(taxRate),
        discount: Number(discount),
        notes,
        items: items as InvoiceItemInput[],
      };
      const result = invoice
        ? await updateInvoice(invoice.id, data)
        : await createInvoice(data);

      if ("error" in result && result.error) {
        toast.error(String(result.error));
        return;
      }
      toast.success(invoice ? "Fatura güncellendi" : "Fatura oluşturuldu");
      router.push(invoice ? `/dashboard/faturalar/${invoice.id}` : `/dashboard/faturalar/${result.data?.id}`);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Müşteri</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` - ${c.company}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fatura Türü</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SATIS">Satış Faturası</SelectItem>
                  <SelectItem value="ALIS">Alış Faturası</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "TRY" | "USD")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TL (Türk Lirası)</SelectItem>
                  <SelectItem value="USD">USD (Amerikan Doları)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fatura Tarihi</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Vade Tarihi</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Ürün / Hizmet Satırları</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setItems((p) => [...p, emptyLine()])}>
                <Plus className="h-4 w-4" /> Satır Ekle
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-12">
                  <Input className="xl:col-span-3" placeholder="Ürün adı" value={item.productName} onChange={(e) => updateLine(idx, { productName: e.target.value })} />
                  <Input className="xl:col-span-3" placeholder="Açıklama" value={item.description} onChange={(e) => updateLine(idx, { description: e.target.value })} />
                  <Input className="xl:col-span-1" type="number" min="0" step="0.01" placeholder="Adet" value={item.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })} />
                  <Input className="xl:col-span-2" placeholder="Birim" value={item.unit} onChange={(e) => updateLine(idx, { unit: e.target.value })} />
                  <Input className="xl:col-span-2" type="number" min="0" step="0.01" placeholder="Birim fiyat" value={item.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })} />
                  <div className="flex items-center justify-between gap-2 xl:col-span-1">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {formatCurrency(Number(item.quantity) * Number(item.unitPrice), currency)}
                    </span>
                    <Button type="button" size="icon" variant="ghost" disabled={items.length === 1} onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>KDV (%)</Label>
              <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>İndirim ({currency === "USD" ? "$" : "₺"})</Label>
              <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500"><span>Ara Toplam</span><span>{formatCurrency(totals.subtotal, currency)}</span></div>
              <div className="flex justify-between text-slate-500"><span>KDV</span><span>{formatCurrency(totals.taxAmount, currency)}</span></div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2"><span>Genel Toplam</span><span>{formatCurrency(totals.total, currency)}</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ödeme koşulları, özel notlar..." />
          </div>

          <Button disabled={pending} type="submit">
            {pending ? "Kaydediliyor..." : invoice ? "Faturayı Güncelle" : "Fatura Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
