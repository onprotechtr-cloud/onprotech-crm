"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCashAccount, updateCashAccount, type CreateAccountInput } from "@/lib/actions/cashbank-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CashAccountFormProps = {
  account?: {
    id: string;
    name: string;
    type: string;
    bankName: string | null;
    accountNumber: string | null;
    iban: string | null;
    currency: string;
    balance: number;
  } | null;
};

export function CashAccountForm({ account }: CashAccountFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<"KASA" | "BANKA">((account?.type as "KASA" | "BANKA") ?? "KASA");
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? "");
  const [iban, setIban] = useState(account?.iban ?? "");
  const [currency, setCurrency] = useState<"TRY" | "USD">((account?.currency as "TRY" | "USD") ?? "TRY");
  const [balance, setBalance] = useState(account?.balance ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Hesap adı giriniz"); return; }
    startTransition(async () => {
      const data: CreateAccountInput = { name, type, bankName: bankName || undefined, accountNumber: accountNumber || undefined, iban: iban || undefined, currency, balance: Number(balance) };
      const result = account ? await updateCashAccount(account.id, data) : await createCashAccount(data);
      if ("error" in result && result.error) { toast.error(String(result.error)); return; }
      toast.success(account ? "Hesap güncellendi" : "Hesap oluşturuldu");
      router.push(account ? `/dashboard/kasa-banka/${account.id}` : `/dashboard/kasa-banka/${result.data?.id}`);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hesap Adı</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. Ana Kasa" />
            </div>
            <div className="space-y-2">
              <Label>Hesap Türü</Label>
              <Select value={type} onValueChange={(v) => setType(v as "KASA" | "BANKA")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KASA">Kasa (Nakit)</SelectItem>
                  <SelectItem value="BANKA">Banka Hesabı</SelectItem>
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
              <Label>Başlangıç Bakiyesi</Label>
              <Input type="number" min="0" step="0.01" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
            </div>
            {type === "BANKA" && (
              <>
                <div className="space-y-2">
                  <Label>Banka Adı</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="ör. İş Bankası" />
                </div>
                <div className="space-y-2">
                  <Label>Hesap Numarası</Label>
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Hesap numarası" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>IBAN</Label>
                  <Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="TR00 0000 0000 0000 0000 0000 00" className="font-mono" />
                </div>
              </>
            )}
          </div>
          <Button disabled={pending} type="submit">
            {pending ? "Kaydediliyor..." : account ? "Hesabı Güncelle" : "Hesap Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
