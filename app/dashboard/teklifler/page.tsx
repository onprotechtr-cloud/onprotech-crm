import Link from "next/link";
import { Plus } from "lucide-react";
import { getQuotes } from "@/lib/data";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { QuoteStatusBadge } from "@/components/quote-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statuses = [
  { key: "ALL", label: "Tümü" },
  { key: "DRAFT", label: "Taslak" },
  { key: "SENT", label: "Gönderildi" },
  { key: "ACCEPTED", label: "Onaylandı" },
  { key: "REJECTED", label: "Reddedildi" },
] as const;

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const currentStatus = searchParams.status ?? "ALL";
  const quotes = await getQuotes(currentStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Teklifler</h2>
          <p className="text-sm text-slate-500">Durum bazlı filtreleme ile teklif süreçlerini takip edin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teklifler/yeni">
            <Plus className="h-4 w-4" />
            Yeni Teklif
          </Link>
        </Button>
      </div>

      <Tabs value={currentStatus}>
        <TabsList>
          {statuses.map((status) => (
            <TabsTrigger key={status.key} value={status.key} asChild>
              <Link href={`/dashboard/teklifler?status=${status.key}`}>{status.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={currentStatus}>
          {quotes.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Teklif Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table className="mobile-card-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teklif No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Geçerlilik</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell data-label="Teklif No">
                          <Link href={`/dashboard/teklifler/${quote.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                            {quote.quoteNumber}
                          </Link>
                        </TableCell>
                        <TableCell data-label="Müşteri">{quote.customer.name}</TableCell>
                        <TableCell data-label="Durum">
                          <QuoteStatusBadge status={quote.status} />
                        </TableCell>
                        <TableCell data-label="Tutar">{formatCurrency(quote.total, quote.currency)}</TableCell>
                        <TableCell data-label="Tarih">{formatDateShort(quote.date)}</TableCell>
                        <TableCell data-label="Geçerlilik">{formatDateShort(quote.validUntil)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Teklif bulunamadı" description="Seçili filtrede kayıt yok. Yeni bir teklif oluşturabilirsiniz." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}