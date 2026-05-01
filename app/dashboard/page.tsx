import Link from "next/link";
import { AlertTriangle, CalendarClock, Package, ReceiptText, Users, Warehouse, Wrench } from "lucide-react";
import { getDashboardData, getDashboardServiceStats, getDashboardWarehouseStats } from "@/lib/data";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/quote-status-badge";
import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

const serviceStatusLabels: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ATANDI: "Atandı",
  YOLDA: "Yolda",
  BASLADIM: "Başladım",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

const serviceStatusVariants: Record<string, "default" | "warning" | "accent" | "success" | "danger"> = {
  BEKLEMEDE: "default",
  ATANDI: "accent",
  YOLDA: "warning",
  BASLADIM: "accent",
  TAMAMLANDI: "success",
  IPTAL: "danger",
};

export default async function DashboardPage() {
  const [data, serviceStats, warehouseStats] = await Promise.all([
    getDashboardData(),
    getDashboardServiceStats(),
    getDashboardWarehouseStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Genel Bakış</h2>
        <p className="text-sm text-slate-500">
          Satış ekibinizin bugünki performans özetini buradan takip edin.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Toplam Müşteri"
          value={String(data.totalCustomers)}
          description="Kayıtlı portföy büyüklüğü"
        />
        <KpiCard
          title="Bekleyen Teklif"
          value={String(data.pendingQuotes)}
          description="Taslak veya gönderilen teklifler"
        />
        <KpiCard
          title="Aktif Servis"
          value={String(serviceStats.pendingCount)}
          description="Devam eden servis emirleri"
        />
        <KpiCard
          title="Aylık Ciro"
          value={formatCurrency(data.monthlyRevenue)}
          description="Onaylanan teklifler toplamı"
        />
      </div>

      {/* Low stock alert */}
      {data.lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">
              Kritik Stok Uyarısı ({data.lowStockProducts.length} ürün)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.lowStockProducts.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/stok/${p.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm hover:bg-amber-100"
              >
                <Package className="h-3 w-3" />
                {p.name}: {p.stockQuantity}/{p.minStockLevel} {p.unit}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <QuickActions />

      {/* Main widgets row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Today's appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bugünkü Randevular</CardTitle>
            <CalendarClock className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-3">
            {data.todayAppointments.length ? (
              data.todayAppointments.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/randevular/${a.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-orange-300"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-sm text-slate-500">{a.customer.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {a.startTime} - {a.endTime}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </Link>
              ))
            ) : (
              <EmptyState
                title="Bugün için randevu yok"
                description="Yeni bir randevu oluşturarak takvimi planlayabilirsiniz."
              />
            )}
          </CardContent>
        </Card>

        {/* Recent service orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Servis Emirleri</CardTitle>
            <Wrench className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceStats.recentOrders.length ? (
              serviceStats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/teknik-servis/${order.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-orange-300"
                >
                  <div>
                    <p className="font-semibold text-slate-900 line-clamp-1">{order.title}</p>
                    <p className="text-sm text-slate-500">{order.customer.name}</p>
                    {order.assignedTo && (
                      <p className="mt-1 text-xs text-slate-400">{order.assignedTo.name}</p>
                    )}
                  </div>
                  <Badge variant={serviceStatusVariants[order.status] ?? "default"}>
                    {serviceStatusLabels[order.status] ?? order.status}
                  </Badge>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Servis emri yok"
                description="Teknik servis modülünden yeni bir servis emri oluşturun."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warehouse summary */}
      {warehouseStats.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Depo Özeti</CardTitle>
            <Warehouse className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {warehouseStats.map((w) => (
                <Link
                  key={w.id}
                  href={`/dashboard/depolar/${w.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:border-orange-300 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{w.name}</p>
                    <p className="text-sm text-slate-500">{w.productCount} ürün çeşidi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{w.totalItems}</p>
                    {w.lowStockCount > 0 && (
                      <p className="text-xs text-rose-500">{w.lowStockCount} kritik</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Son Teklifler</CardTitle>
          <ReceiptText className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentQuotes.length ? (
            data.recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/dashboard/teklifler/${quote.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-orange-300"
              >
                <div>
                  <p className="font-semibold text-slate-900">{quote.quoteNumber}</p>
                  <p className="text-sm text-slate-500">{quote.customer.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateShort(quote.date)}
                  </p>
                </div>
                <div className="text-right">
                  <QuoteStatusBadge status={quote.status} />
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatCurrency(quote.total, quote.currency)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="Henüz teklif yok"
              description="İlk teklifinizi oluşturarak satış sürecini başlatınız."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
