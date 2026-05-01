import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { getSubscriptions, getExpiringSubscriptions } from "@/lib/actions/subscription-actions";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

const statuses = [
  { key: "ALL", label: "Tümü" },
  { key: "AKTIF", label: "Aktif" },
  { key: "PASIF", label: "Pasif" },
  { key: "IPTAL", label: "İptal" },
  { key: "SURESI_DOLDU", label: "Süresi Doldu" },
] as const;

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "accent" }> = {
  AKTIF: { label: "Aktif", variant: "success" },
  PASIF: { label: "Pasif", variant: "default" },
  IPTAL: { label: "İptal", variant: "danger" },
  SURESI_DOLDU: { label: "Süresi Doldu", variant: "warning" },
};

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const currentStatus = searchParams.status ?? "ALL";
  const [subscriptions, expiring] = await Promise.all([
    getSubscriptions(currentStatus),
    getExpiringSubscriptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Abonelikler</h2>
          <p className="text-sm text-slate-500">Müşteri aboneliklerini ve yenileme tarihlerini takip edin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/abonelikler/yeni">
            <Plus className="h-4 w-4" />Yeni Abonelik
          </Link>
        </Button>
      </div>

      {expiring.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">
              Yakında Sona Erecek ({expiring.length} abonelik — 30 gün içinde)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {expiring.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/abonelikler/${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm hover:bg-amber-100"
              >
                {s.customer.name} — {s.planName}: {formatDateShort(s.endDate)}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={currentStatus}>
        <TabsList className="flex-wrap">
          {statuses.map((s) => (
            <TabsTrigger key={s.key} value={s.key} asChild>
              <Link href={`/dashboard/abonelikler?status=${s.key}`}>{s.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={currentStatus}>
          {subscriptions.length ? (
            <Card>
              <CardHeader><CardTitle>Abonelik Listesi ({subscriptions.length})</CardTitle></CardHeader>
              <CardContent>
                <Table className="mobile-card-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Bitiş Tarihi</TableHead>
                      <TableHead>Sonraki Fatura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const cfg = statusConfig[sub.status] ?? { label: sub.status, variant: "default" as const };
                      const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);
                      return (
                        <TableRow key={sub.id}>
                          <TableCell data-label="Müşteri">
                            <Link href={`/dashboard/abonelikler/${sub.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                              {sub.customer.name}
                            </Link>
                          </TableCell>
                          <TableCell data-label="Plan">{sub.planName}</TableCell>
                          <TableCell data-label="Tür">
                            <Badge variant="default">{sub.type === "AYLIK" ? "Aylık" : "Yıllık"}</Badge>
                          </TableCell>
                          <TableCell data-label="Tutar">{formatCurrency(sub.amount, sub.currency)}</TableCell>
                          <TableCell data-label="Durum">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </TableCell>
                          <TableCell data-label="Bitiş Tarihi">
                            <span className={daysLeft <= 30 && sub.status === "AKTIF" ? "text-amber-600 font-medium" : ""}>
                              {formatDateShort(sub.endDate)}
                              {daysLeft <= 30 && sub.status === "AKTIF" && ` (${daysLeft}g)`}
                            </span>
                          </TableCell>
                          <TableCell data-label="Sonraki Fatura">{formatDateShort(sub.nextBillingDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Abonelik bulunamadı" description="Yeni bir abonelik oluşturabilirsiniz." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
