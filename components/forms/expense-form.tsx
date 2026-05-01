"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createExpense, updateExpense, type CreateExpenseInput } from "@/lib/actions/expense-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string };

type ExpenseFormProps = {
  categories: Category[];
  expense?: {
    id: string;
    categoryId: string;
    title: string;
    description: string | null;
    amount: number;
    currency: string;
    date: Date;
    paymentMethod: string;
    receipt: string | null;
  } | null;
};

export function ExpenseForm({ categories, expense }: ExpenseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [title, setTitle] = useState(expense?.title ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? 0);
  const [currency, setCurrency] = useState<"TRY" | "USD">((expense?.currency as "TRY" | "USD") ?? "TRY");
  const [date, setDate] = useState(expense ? new Date(expense.date).toISOString().slice(0, 10) : today);
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod ?? "NAKIT");
  const [receipt, setReceipt] = useState(expense?.receipt ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast.error("Kategori seçiniz"); return; }
    if (!title.trim()) { toast.error("Başlık giriniz"); return; }
    if (Number(amount) <= 0) { toast.error("Tutar 0'dan büyük olmalıdır"); return; }
    startTransition(async () => {
      const data: CreateExpenseInput = { categoryId, title, description, amount: Number(amount), currency, date, paymentMethod, receipt: receipt || undefined };
      const result = expense ? await updateExpense(expense.id, data) : await createExpense(data);
      if ("error" in result && result.error) { toast.error(String(result.error)); return; }
      toast.success(expense ? "Masraf güncellendi" : "Masraf oluşturuldu");
      router.push(expense ? `/dashboard/masraflar/${expense.id}` : `/dashboard/masraflar/${result.data?.id}`);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Başlık</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masraf başlığı..." />
            </div>
            <div className="space-y-2">
              <Label>Tutar</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
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
              <Label>Tarih</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ödeme Yöntemi</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAKIT">Nakit</SelectItem>
                  <SelectItem value="HAVALE">Havale/EFT</SelectItem>
                  <SelectItem value="KREDI_KARTI">Kredi Kartı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fiş / Makbuz No (opsiyonel)</Label>
              <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="Fiş veya makbuz numarası..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Masraf açıklaması..." />
          </div>
          <Button disabled={pending} type="submit">
            {pending ? "Kaydediliyor..." : expense ? "Masrafı Güncelle" : "Masraf Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
