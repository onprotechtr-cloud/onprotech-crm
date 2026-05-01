import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getExpenseById } from "@/lib/actions/expense-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseApprovalActions } from "@/components/expenses/ExpenseApprovalActions";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  BEKLEMEDE: { label: "Onay Bekliyor", variant: "warning" },
  ONAYLANDI: { label: "Onaylandı", variant: "success" },
  REDDEDILDI: { label: "Reddedildi", variant: "danger" },
};

const methodLabels: Record<string, string> = {
  NAKIT: "Nakit",
  HAVALE: "Havale/EFT",
  KREDI_KARTI: "Kredi Kartı",
};

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const expense = await getExpenseById(params.id);
  if (!expense) notFound();

  const cfg = statusConfig[expense.status] ?? { label: expense.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{expense.title}</h2>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-slate-500">{expense.category.name} • {formatDate(expense.date)}</p>
        </div>
        {expense.status === "BEKLEMEDE" && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/masraflar/${expense.id}/duzenle`}><Pencil className="h-4 w-4" />Düzenle</Link>
          </Button>
        )}
      </div>

      {expense.status === "BEKLEMEDE" && (
        <Card>
          <CardHeader><CardTitle>Onay İşlemi</CardTitle></CardHeader>
          <CardContent>
            <ExpenseApprovalActions expenseId={expense.id} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Masraf Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div><div className="font-medium text-slate-900">Başlık</div><div>{expense.title}</div></div>
            <div><div className="font-medium text-slate-900">Kategori</div><div>{expense.category.name}</div></div>
            <div><div className="font-medium text-slate-900">Tutar</div><div className="text-xl font-bold text-slate-900">{formatCurrency(expense.amount, expense.currency)}</div></div>
            <div><div className="font-medium text-slate-900">Ödeme Yöntemi</div><div>{methodLabels[expense.paymentMethod] ?? expense.paymentMethod}</div></div>
            <div><div className="font-medium text-slate-900">Tarih</div><div>{formatDate(expense.date)}</div></div>
            {expense.receipt && <div><div className="font-medium text-slate-900">Fiş No</div><div>{expense.receipt}</div></div>}
            {expense.description && <div><div className="font-medium text-slate-900">Açıklama</div><div>{expense.description}</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Onay Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div><div className="font-medium text-slate-900">Oluşturan</div><div>{expense.createdBy.name}</div></div>
            <div><div className="font-medium text-slate-900">Durum</div><Badge variant={cfg.variant}>{cfg.label}</Badge></div>
            {expense.approvedBy && (
              <div><div className="font-medium text-slate-900">Onaylayan / Reddeden</div><div>{expense.approvedBy.name}</div></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
