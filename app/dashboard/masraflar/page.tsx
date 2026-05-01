import Link from "next/link";
import { Plus } from "lucide-react";
import { getExpenses, getExpenseCategories, getMonthlyExpenseSummary } from "@/lib/actions/expense-actions";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/empty-state";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  BEKLEMEDE: { label: "Beklemede", variant: "warning" },
  ONAYLANDI: { label: "Onaylandı", variant: "success" },
  REDDEDILDI: { label: "Reddedildi", variant: "danger" },
};

const methodLabels: Record<string, string> = {
  NAKIT: "Nakit",
  HAVALE: "Havale/EFT",
  KREDI_KARTI: "Kredi Kartı",
};

const statuses = [
  { key: "ALL", label: "Tümü" },
  { key: "BEKLEMEDE", label: "Beklemede" },
  { key: "ONAYLANDI", label: "Onaylandı" },
  { key: "REDDEDILDI", label: "Reddedildi" },
] as const;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { status?: string; categoryId?: string };
}) {
  const currentStatus = searchParams.status ?? "ALL";
  const [expenses, categories, summary] = await Promise.all([
    getExpenses(searchParams.categoryId, currentStatus),
    getExpenseCategories(),
    getMonthlyExpenseSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Masraf Merkezi</h2>
          <p className="text-sm text-slate-500">Gider kayıtlarını oluşturun ve onay süreçlerini yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/masraflar/yeni"><Plus className="h-4 w-4" />Yeni Masraf</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard title="Bu Ay Onaylanan" value={formatCurrency(summary.monthlyTotal)} description="Onaylanan masraf toplamı" />
        <KpiCard title="Bekleyen Onay" value={String(summary.pendingCount)} description="Onay bekleyen masraf sayısı" />
        <KpiCard title="Toplam Kayıt" value={String(expenses.length)} description="Listelenen masraf sayısı" />
      </div>

      <Tabs value={currentStatus}>
        <TabsList className="flex-wrap">
          {statuses.map((s) => (
            <TabsTrigger key={s.key} value={s.key} asChild>
              <Link href={`/dashboard/masraflar?status=${s.key}`}>{s.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={currentStatus}>
          {expenses.length ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Masraf Listesi ({expenses.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                    defaultValue={searchParams.categoryId ?? ""}
                    onChange={(e) => {
                      const url = new URL(window.location.href);
                      if (e.target.value) url.searchParams.set("categoryId", e.target.value);
                      else url.searchParams.delete("categoryId");
                      window.location.href = url.toString();
                    }}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="mobile-card-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Oluşturan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((exp) => {
                      const cfg = statusConfig[exp.status] ?? { label: exp.status, variant: "default" as const };
                      return (
                        <TableRow key={exp.id}>
                          <TableCell data-label="Başlık">
                            <Link href={`/dashboard/masraflar/${exp.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                              {exp.title}
                            </Link>
                          </TableCell>
                          <TableCell data-label="Kategori">{exp.category.name}</TableCell>
                          <TableCell data-label="Tutar">{formatCurrency(exp.amount, exp.currency)}</TableCell>
                          <TableCell data-label="Ödeme Yöntemi">{methodLabels[exp.paymentMethod] ?? exp.paymentMethod}</TableCell>
                          <TableCell data-label="Durum"><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                          <TableCell data-label="Tarih">{formatDateShort(exp.date)}</TableCell>
                          <TableCell data-label="Oluşturan">{exp.createdBy.name}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Masraf bulunamadı" description="Yeni bir masraf kaydı oluşturabilirsiniz." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
