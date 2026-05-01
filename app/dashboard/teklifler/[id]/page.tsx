import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { getQuoteById } from "@/lib/data";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { QuoteStatusBadge } from "@/components/quote-status-badge";
import { QuoteStatusActions } from "@/components/quote-status-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertToInvoiceButton } from "@/components/quotes/ConvertToInvoiceButton";

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await getQuoteById(params.id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{quote.quoteNumber}</h2>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-sm text-slate-500">{quote.customer.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/teklifler/${quote.id}/duzenle`}>
              <Pencil className="h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <Button asChild>
            <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              PDF İndir
            </a>
          </Button>
          {quote.status === "ACCEPTED" && (
            <ConvertToInvoiceButton quoteId={quote.id} />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Durum Yönetimi</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteStatusActions quoteId={quote.id} currentStatus={quote.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Teklif Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <div className="font-medium text-slate-900">Müşteri</div>
              <div>{quote.customer.name}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Hazırlayan</div>
              <div>{quote.user.name}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Teklif Tarihi</div>
              <div>{formatDate(quote.date)}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Geçerlilik</div>
              <div>{formatDate(quote.validUntil)}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Para Birimi</div>
              <div>{quote.currency === "USD" ? "USD (Amerikan Dolari)" : "TRY (Turk Lirasi)"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Notlar</div>
              <div>{quote.notes ?? "Ek not bulunmuyor."}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tutar Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Ara Toplam</span>
              <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>KDV (%{quote.taxRate})</span>
              <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>İndirim</span>
              <span>{formatCurrency(quote.discount, quote.currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
              <span>Genel Toplam</span>
              <span>{formatCurrency(quote.total, quote.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Satırları</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Birim</TableHead>
                <TableHead>Birim Fiyat</TableHead>
                <TableHead>Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-slate-900">{item.productName}</TableCell>
                  <TableCell>{item.description ?? "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice, quote.currency)}</TableCell>
                  <TableCell>{formatCurrency(item.total, quote.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-slate-500">Son güncelleme: {formatDateShort(quote.updatedAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
