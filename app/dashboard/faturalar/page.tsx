import Link from "next/link";
import { Plus } from "lucide-react";
import { getInvoices } from "@/lib/actions/invoice-actions";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

const statuses = [
  { key: "ALL", label: "Tümü" },
  { key: "TASLAK", label: "Taslak" },
  { key: "GONDERILDI", label: "Gönderildi" },
  { key: "ODENDI", label: "Ödendi" },
  { key: "GECIKTI", label: "Gecikti" },
  { key: "IPTAL", label: "İptal" },
] as const;

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  TASLAK: { label: "Taslak", variant: "default" },
  GONDERILDI: { label: "Gönderildi", variant: "accent" },
  ODENDI: { label: "Ödendi", variant: "success" },
  GECIKTI: { label: "Gecikti", variant: "danger" },
  IPTAL: { label: "İptal", variant: "default" },
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const currentStatus = searchParams.status ?? "ALL";
  const invoices = await getInvoices(currentStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Faturalar</h2>
          <p className="text-sm text-slate-500">Satış ve alış faturalarını yönetin, ödeme durumlarını takip edin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/faturalar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Fatura
          </Link>
        </Button>
      </div>

      <Tabs value={currentStatus}>
        <TabsList className="flex-wrap">
          {statuses.map((s) => (
            <TabsTrigger key={s.key} value={s.key} asChild>
              <Link href={`/dashboard/faturalar?status=${s.key}`}>{s.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={currentStatus}>
          {invoices.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Fatura Listesi ({invoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="mobile-card-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fatura No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Kalan</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Vade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => {
                      const cfg = statusConfig[inv.status] ?? { label: inv.status, variant: "default" as const };
                      return (
                        <TableRow key={inv.id}>
                          <TableCell data-label="Fatura No">
                            <Link href={`/dashboard/faturalar/${inv.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                              {inv.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell data-label="Müşteri">{inv.customer.name}</TableCell>
                          <TableCell data-label="Durum">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </TableCell>
                          <TableCell data-label="Tutar">{formatCurrency(inv.total, inv.currency)}</TableCell>
                          <TableCell data-label="Kalan">
                            <span className={inv.remainingAmount > 0 ? "text-rose-600 font-medium" : "text-green-600"}>
                              {formatCurrency(inv.remainingAmount, inv.currency)}
                            </span>
                          </TableCell>
                          <TableCell data-label="Tarih">{formatDateShort(inv.date)}</TableCell>
                          <TableCell data-label="Vade">{formatDateShort(inv.dueDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Fatura bulunamadı" description="Seçili filtrede kayıt yok. Yeni bir fatura oluşturabilirsiniz." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
