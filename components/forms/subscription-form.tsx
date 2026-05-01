"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSubscription, updateSubscription, type CreateSubscriptionInput } from "@/lib/actions/subscription-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

type Customer = { id: string; name: string; company: string | null };

type SubscriptionFormProps = {
  customers: Customer[];
  subscription?: {
    id: string;
    customerId: string;
    planName: string;
    description: string | null;
    type: string;
    amount: number;
    currency: string;
    startDate: Date;
    autoRenew: boolean;
    notes: string | null;
  } | null;
};

export function SubscriptionForm({ customers, subscription }: SubscriptionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);
  const [customerId, setCustomerId] = useState(subscription?.customerId ?? "");
  const [planName, setPlanName] = useState(subscription?.planName ?? "");
  const [description, setDescription] = useState(subscription?.description ?? "");
  const [type, setType] = useState<"AYLIK" | "YILLIK">((subscription?.type as "AYLIK" | "YILLIK") ?? "AYLIK");
  const [amount, setAmount] = useState(subscription?.amount ?? 0);
  const [currency, setCurrency] = useState<"TRY" | "USD">((subscription?.currency as "TRY" | "USD") ?? "TRY");
  const [startDate, setStartDate] = useState(subscription ? new Date(subscription.startDate).toISOString().slice(0, 10) : today);
  const [autoRenew, setAutoRenew] = useState(subscription?.autoRenew ?? true);
  const [notes, setNotes] = useState(subscription?.notes ?? "");

  const endDatePreview = (() => {
    const start = new Date(startDate);
    if (type === "YILLIK") start.setFullYear(start.getFullYear() + 1);
    else start.setMonth(start.getMonth() + 1);
    return start.toISOString().slice(0, 10);
  })();

  const yearlyAmount = type === "AYLIK" ? amount * 12 : amount;
  const monthlyAmount = type === "YILLIK" ? amount / 12 : amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error("Müşteri seçiniz"); return; }
    if (!planName.trim()) { toast.error("Plan adı giriniz"); return; }
    startTransition(async () => {
      const data: CreateSubscriptionInput = { customerId, planName, description, type, amount: Number(amount), currency, startDate, autoRenew, notes };
      const result = subscription
        ? await updateSubscription(subscription.id, data)
        : await createSubscription(data);
      if ("error" in result && result.error) { toast.error(String(result.error)); return; }
      toast.success(subscription ? "Abonelik güncellendi" : "Abonelik oluşturuldu");
      router.push(subscription ? `/dashboard/abonelikler/${subscription.id}` : `/dashboard/abonelikler/${result.data?.id}`);
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
              <Label>Plan Adı</Label>
              <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="ör. VMS Pro Lisans" />
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
              <Label>Abonelik Türü</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("AYLIK")}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${type === "AYLIK" ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  Aylık
                </button>
                <button
                  type="button"
                  onClick={() => setType("YILLIK")}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${type === "YILLIK" ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  Yıllık
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tutar ({type === "AYLIK" ? "aylık" : "yıllık"})</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div className="rounded-xl bg-slate-50 p-3 space-y-1 text-sm self-end">
              <div className="flex justify-between text-slate-500"><span>Aylık</span><span>{formatCurrency(monthlyAmount, currency)}</span></div>
              <div className="flex justify-between font-semibold text-slate-900"><span>Yıllık</span><span>{formatCurrency(yearlyAmount, currency)}</span></div>
            </div>
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tahmini Bitiş Tarihi</Label>
              <Input type="date" value={endDatePreview} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Otomatik Yenileme</Label>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAutoRenew(true)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${autoRenew ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >Açık</button>
                <button
                  type="button"
                  onClick={() => setAutoRenew(false)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${!autoRenew ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >Kapalı</button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Plan açıklaması..." />
          </div>
          <div className="space-y-2">
            <Label>Notlar</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Özel notlar..." />
          </div>
          <Button disabled={pending} type="submit">
            {pending ? "Kaydediliyor..." : subscription ? "Aboneliği Güncelle" : "Abonelik Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
