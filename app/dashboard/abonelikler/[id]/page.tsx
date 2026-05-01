import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getSubscriptionById } from "@/lib/actions/subscription-actions";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscriptionStatusActions } from "@/components/subscriptions/SubscriptionStatusActions";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  AKTIF: { label: "Aktif", variant: "success" },
  PASIF: { label: "Pasif", variant: "default" },
  IPTAL: { label: "İptal", variant: "danger" },
  SURESI_DOLDU: { label: "Süresi Doldu", variant: "warning" },
};

const paymentStatusConfig: Record<string, { label: string; variant: "default" | "success" | "danger" | "warning" }> = {
  ODENDI: { label: "Ödendi", variant: "success" },
  BEKLEMEDE: { label: "Beklemede", variant: "warning" },
  BASARISIZ: { label: "Başarısız", variant: "danger" },
};

const methodLabels: Record<string, string> = {
  NAKIT: "Nakit",
  HAVALE: "Havale/EFT",
  KREDI_KARTI: "Kredi Kartı",
};

export default async function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const sub = await getSubscriptionById(params.id);
  if (!sub) notFound();

  const cfg = statusConfig[sub.status] ?? { label: sub.status, variant: "default" as const };
  const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">{sub.planName}</h2>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            <Badge variant="default">{sub.type === "AYLIK" ? "Aylık" : "Yıllık"}</Badge>
          </div>
          <p className="text-sm text-slate-500">{sub.customer.name}{sub.customer.company ? ` — ${sub.customer.company}` : ""}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/abonelikler/${sub.id}/duzenle`}><Pencil className="h-4 w-4" />Düzenle</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Durum Yönetimi</CardTitle></CardHeader>
        <CardContent>
          <SubscriptionStatusActions subscriptionId={sub.id} currentStatus={sub.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Abonelik Detayları</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div><div className="font-medium text-slate-900">Müşteri</div><div>{sub.customer.name}</div></div>
            <div><div className="font-medium text-slate-900">Plan Adı</div><div>{sub.planName}</div></div>
            {sub.description && <div><div className="font-medium text-slate-900">Açıklama</div><div>{sub.description}</div></div>}
            <div><div className="font-medium text-slate-900">Tutar</div><div className="text-lg font-semibold text-slate-900">{formatCurrency(sub.amount, sub.currency)} / {sub.type === "AYLIK" ? "ay" : "yıl"}</div></div>
            <div><div className="font-medium text-slate-900">Başlangıç</div><div>{formatDate(sub.startDate)}</div></div>
            <div>
              <div className="font-medium text-slate-900">Bitiş</div>
              <div className={daysLeft <= 30 && sub.status === "AKTIF" ? "text-amber-600 font-medium" : ""}>
                {formatDate(sub.endDate)} {daysLeft > 0 && sub.status === "AKTIF" ? `(${daysLeft} gün kaldı)` : ""}
              </div>
            </div>
            <div><div className="font-medium text-slate-900">Sonraki Fatura</div><div>{formatDate(sub.nextBillingDate)}</div></div>
            <div><div className="font-medium text-slate-900">Otomatik Yenileme</div><div>{sub.autoRenew ? "Aktif" : "Pasif"}</div></div>
            {sub.notes && <div><div className="font-medium text-slate-900">Notlar</div><div>{sub.notes}</div></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ödeme Geçmişi ({sub.payments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sub.payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Yöntem</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sub.payments.map((p) => {
                    const pCfg = paymentStatusConfig[p.status] ?? { label: p.status, variant: "default" as const };
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{formatDateShort(p.paymentDate)}</TableCell>
                        <TableCell>{formatCurrency(p.amount, p.currency)}</TableCell>
                        <TableCell>{methodLabels[p.method] ?? p.method}</TableCell>
                        <TableCell><Badge variant={pCfg.variant}>{pCfg.label}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500">Henüz ödeme kaydı bulunmuyor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
