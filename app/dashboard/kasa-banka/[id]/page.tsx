import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getCashAccountById } from "@/lib/actions/cashbank-actions";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CashAccountDetailPage({ params }: { params: { id: string } }) {
  const account = await getCashAccountById(params.id);
  if (!account) notFound();

  const income = account.transactions.filter((t) => t.type === "GELIR").reduce((s, t) => s + t.amount, 0);
  const expense = account.transactions.filter((t) => t.type === "GIDER").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{account.name}</h2>
            <Badge variant="default">{account.type === "KASA" ? "Kasa" : "Banka"}</Badge>
          </div>
          {account.bankName && <p className="text-sm text-slate-500">{account.bankName}</p>}
          {account.iban && <p className="text-xs text-slate-400 font-mono">{account.iban}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/dashboard/kasa-banka/${account.id}/islem`}><Plus className="h-4 w-4" />Yeni İşlem</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Güncel Bakiye</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(account.balance, account.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Toplam Gelir</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(income, account.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-500">Toplam Gider</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(expense, account.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>İşlem Geçmişi ({account.transactions.length})</CardTitle></CardHeader>
        <CardContent>
          {account.transactions.length > 0 ? (
            <Table className="mobile-card-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>İlişkili</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell data-label="Tarih">{formatDateShort(tx.date)}</TableCell>
                    <TableCell data-label="Açıklama">{tx.description}</TableCell>
                    <TableCell data-label="Kategori">{tx.category}</TableCell>
                    <TableCell data-label="Tür">
                      <Badge variant={tx.type === "GELIR" ? "success" : "danger"}>
                        {tx.type === "GELIR" ? "Gelir" : "Gider"}
                      </Badge>
                    </TableCell>
                    <TableCell data-label="Tutar">
                      <span className={tx.type === "GELIR" ? "text-green-600 font-medium" : "text-rose-600 font-medium"}>
                        {tx.type === "GELIR" ? "+" : "-"}{formatCurrency(tx.amount, account.currency)}
                      </span>
                    </TableCell>
                    <TableCell data-label="İlişkili">
                      {tx.invoice ? (
                        <Link href={`/dashboard/faturalar/${tx.relatedInvoiceId}`} className="text-orange-600 hover:underline text-xs">
                          {tx.invoice.invoiceNumber}
                        </Link>
                      ) : tx.subscription ? (
                        <Link href={`/dashboard/abonelikler/${tx.relatedSubscriptionId}`} className="text-orange-600 hover:underline text-xs">
                          {tx.subscription.planName}
                        </Link>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-slate-500">Henüz işlem bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
