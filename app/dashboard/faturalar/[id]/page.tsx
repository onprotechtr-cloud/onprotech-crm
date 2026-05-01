import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getInvoiceById } from "@/lib/actions/invoice-actions";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceStatusActions } from "@/components/invoices/InvoiceStatusActions";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  TASLAK: { label: "Taslak", variant: "default" },
  GONDERILDI: { label: "Gönderildi", variant: "accent" },
  ODENDI: { label: "Ödendi", variant: "success" },
  GECIKTI: { label: "Gecikti", variant: "danger" },
  IPTAL: { label: "İptal", variant: "default" },
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceById(params.id);
  if (!invoice) notFound();

  const cfg = statusConfig[invoice.status] ?? { label: invoice.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{invoice.invoiceNumber}</h2>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-slate-500">{invoice.customer.name}{invoice.customer.company ? ` — ${invoice.customer.company}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/faturalar/${invoice.id}/duzenle`}><Pencil className="h-4 w-4" />Düzenle</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Durum Yönetimi</CardTitle></CardHeader>
        <CardContent>
          <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Fatura Özeti</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div><div className="font-medium text-slate-900">Müşteri</div><div>{invoice.customer.name}</div></div>
            <div><div className="font-medium text-slate-900">Hazırlayan</div><div>{invoice.user.name}</div></div>
            <div><div className="font-medium text-slate-900">Fatura Tarihi</div><div>{formatDate(invoice.date)}</div></div>
            <div><div className="font-medium text-slate-900">Vade Tarihi</div><div>{formatDate(invoice.dueDate)}</div></div>
            <div><div className="font-medium text-slate-900">Para Birimi</div><div>{invoice.currency === "USD" ? "USD (Amerikan Doları)" : "TRY (Türk Lirası)"}</div></div>
            {invoice.sourceQuoteId && (
              <div>
                <div className="font-medium text-slate-900">Kaynak Teklif</div>
                <Link href={`/dashboard/teklifler/${invoice.sourceQuoteId}`} className="text-orange-600 hover:underline">Teklifi görüntüle</Link>
              </div>
            )}
            {invoice.notes && <div><div className="font-medium text-slate-900">Notlar</div><div>{invoice.notes}</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tutar Özeti</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Ara Toplam</span><span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>KDV (%{invoice.taxRate})</span><span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>İndirim</span><span>{formatCurrency(invoice.discount, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
              <span>Genel Toplam</span><span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ödenen</span>
              <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
              <span className="text-slate-500">Kalan</span>
              <span className={`font-semibold ${invoice.remainingAmount > 0 ? "text-rose-600" : "text-green-600"}`}>
                {formatCurrency(invoice.remainingAmount, invoice.currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ürün Satırları</CardTitle></CardHeader>
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
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-slate-900">{item.productName}</TableCell>
                  <TableCell>{item.description ?? "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                  <TableCell>{formatCurrency(item.total, invoice.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-slate-500">Son güncelleme: {formatDateShort(invoice.updatedAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
