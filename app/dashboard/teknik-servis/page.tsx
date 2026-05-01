import Link from "next/link";
import { Plus } from "lucide-react";
import { getServiceOrders } from "@/lib/actions/service-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatDateShort } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ATANDI: "Atandı",
  YOLDA: "Yolda",
  BASLADIM: "Başladım",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

const statusVariants: Record<string, "default" | "warning" | "accent" | "success" | "danger"> = {
  BEKLEMEDE: "default",
  ATANDI: "accent",
  YOLDA: "warning",
  BASLADIM: "accent",
  TAMAMLANDI: "success",
  IPTAL: "danger",
};

const typeLabels: Record<string, string> = {
  KURULUM: "Kurulum",
  BAKIM: "Bakım",
  ARIZA: "Arıza",
  REVIZYON: "Revizyon",
  KONTROL: "Kontrol",
};

const priorityVariants: Record<string, "default" | "warning" | "danger" | "success"> = {
  DUSUK: "default",
  NORMAL: "default",
  YUKSEK: "warning",
  ACIL: "danger",
};

export default async function TeknikServisPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string; priority?: string; q?: string };
}) {
  const orders = await getServiceOrders({
    status: searchParams.status,
    type: searchParams.type,
    priority: searchParams.priority,
    search: searchParams.q,
  });

  const statusCounts = {
    ALL: orders.length,
    BEKLEMEDE: 0,
    ATANDI: 0,
    YOLDA: 0,
    BASLADIM: 0,
    TAMAMLANDI: 0,
    IPTAL: 0,
  };

  const allOrders = await getServiceOrders({});
  allOrders.forEach((o) => {
    if (o.status in statusCounts) {
      statusCounts[o.status as keyof typeof statusCounts]++;
    }
  });

  const currentStatus = searchParams.status ?? "ALL";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Teknik Servis</h2>
          <p className="text-sm text-slate-500">
            Servis emirlerini takip edin ve yönetin.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teknik-servis/yeni">
            <Plus className="h-4 w-4" />
            Yeni Servis Emri
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "BEKLEMEDE", "ATANDI", "YOLDA", "BASLADIM", "TAMAMLANDI", "IPTAL"] as const).map(
          (status) => {
            const count = status === "ALL" ? allOrders.length : statusCounts[status];
            const isActive = currentStatus === status;
            return (
              <Link
                key={status}
                href={status === "ALL" ? "/dashboard/teknik-servis" : `/dashboard/teknik-servis?status=${status}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "Tümü" : statusLabels[status]}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          }
        )}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-5">
          <form className="flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Ara (başlık, no, müşteri...)"
              className="flex-1 min-w-48 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            <select
              name="type"
              defaultValue={searchParams.type ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Tipler</option>
              {Object.entries(typeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select
              name="priority"
              defaultValue={searchParams.priority ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="ACIL">Acil</option>
              <option value="YUKSEK">Yüksek</option>
              <option value="NORMAL">Normal</option>
              <option value="DUSUK">Düşük</option>
            </select>
            {searchParams.status && (
              <input type="hidden" name="status" value={searchParams.status} />
            )}
            <Button type="submit">Filtrele</Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      {orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-orange-300 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500">{order.orderNumber}</span>
                      <Badge variant={statusVariants[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <Badge
                        variant={priorityVariants[order.priority] ?? "default"}
                        className="text-xs"
                      >
                        {order.priority}
                      </Badge>
                    </div>
                    <Link
                      href={`/dashboard/teknik-servis/${order.id}`}
                      className="text-base font-semibold text-slate-900 hover:text-orange-600 line-clamp-1"
                    >
                      {order.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span>{order.customer.name}{order.customer.company ? ` · ${order.customer.company}` : ""}</span>
                      <span className="text-slate-300">|</span>
                      <span>{typeLabels[order.type]}</span>
                      {order.assignedTo && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>{order.assignedTo.name}</span>
                        </>
                      )}
                      {order.location && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>{order.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                    {order.scheduledDate && (
                      <span className="text-xs text-slate-500">
                        {formatDateShort(order.scheduledDate)}
                        {order.scheduledTime ? ` ${order.scheduledTime}` : ""}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {order.usedParts.length} parça
                    </span>
                    <Link
                      href={`/dashboard/teknik-servis/${order.id}`}
                      className="text-xs text-orange-500 hover:underline"
                    >
                      Detay →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Servis emri bulunamadı"
          description="Filtrelerinizi değiştirin veya yeni bir servis emri oluşturun."
        />
      )}
    </div>
  );
}
