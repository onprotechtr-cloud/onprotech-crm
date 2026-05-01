"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTransaction, type CreateTransactionInput } from "@/lib/actions/cashbank-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INCOME_CATEGORIES = ["Fatura Tahsilatı", "Abonelik Tahsilatı", "Avans", "İade", "Diğer Gelir"];
const EXPENSE_CATEGORIES = ["Yakıt", "Yemek", "Ulaşım", "Ofis Giderleri", "Maaş", "Kira", "Fatura Ödemesi", "Diğer Gider"];

type TransactionFormProps = {
  accountId: string;
  accountName: string;
  currency: string;
};

export function TransactionForm({ accountId, accountName, currency }: TransactionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const [txType, setTxType] = useState<"GELIR" | "GIDER">("GELIR");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(today);
  const [customCategory, setCustomCategory] = useState("");

  const categories = txType === "GELIR" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const effectiveCategory = category === "__other" ? customCategory : category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCategory.trim()) { toast.error("Kategori giriniz"); return; }
    if (!description.trim()) { toast.error("Açıklama giriniz"); return; }
    if (Number(amount) <= 0) { toast.error("Tutar 0'dan büyük olmalıdır"); return; }
    startTransition(async () => {
      const data: CreateTransactionInput = {
        accountId,
        type: txType,
        category: effectiveCategory,
        description,
        amount: Number(amount),
        currency,
        date,
      };
      const result = await createTransaction(data);
      if ("error" in result && result.error) { toast.error(String(result.error)); return; }
      toast.success("İşlem kaydedildi, bakiye güncellendi");
      router.push(`/dashboard/kasa-banka/${accountId}`);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg bg-slate-50 px-4 py-2">
            <p className="text-sm text-slate-500">Hesap: <span className="font-semibold text-slate-900">{accountName}</span></p>
          </div>

          <div className="space-y-2">
            <Label>İşlem Türü</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setTxType("GELIR"); setCategory(""); }}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${txType === "GELIR" ? "border-green-500 bg-green-500 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                + Gelir
              </button>
              <button type="button" onClick={() => { setTxType("GIDER"); setCategory(""); }}
                className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${txType === "GIDER" ? "border-rose-500 bg-rose-500 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                - Gider
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="__other">Diğer (elle gir)</SelectItem>
                </SelectContent>
              </Select>
              {category === "__other" && (
                <Input placeholder="Kategori adı..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="İşlem açıklaması..." />
            </div>
            <div className="space-y-2">
              <Label>Tutar ({currency === "USD" ? "$" : "₺"})</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
          </div>

          <Button disabled={pending} type="submit">
            {pending ? "Kaydediliyor..." : "İşlemi Kaydet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
