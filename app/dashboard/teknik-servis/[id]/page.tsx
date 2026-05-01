import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Package, User, Wrench } from "lucide-react";
import { getServiceOrderById } from "@/lib/actions/service-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { ServiceStatusActions } from "@/components/service/ServiceStatusActions";
import { AddServicePartForm } from "@/components/service/AddServicePartForm";
import { RemoveServicePartButton } from "@/components/service/RemoveServicePartButton";

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

const statusFlow: Record<string, string[]> = {
  BEKLEMEDE: ["ATANDI", "IPTAL"],
  ATANDI: ["YOLDA", "IPTAL"],
  YOLDA: ["BASLADIM", "IPTAL"],
  BASLADIM: ["TAMAMLANDI", "IPTAL"],
  TAMAMLANDI: [],
  IPTAL: [],
};

export default async function ServiceOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getServiceOrderById(params.id);
  if (!order) notFound();

  const nextStatuses = statusFlow[order.status] ?? [];
  const totalPartsCost = order.usedParts.reduce(
    (sum, p) => sum + p.quantity * p.product.unitPrice,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/teknik-servis"
              className="text-sm text-slate-500 hover:text-orange-500"
            >
              ← Teknik Servis
            </Link>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">{order.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="font-mono text-xs text-slate-500">{order.orderNumber}</span>
            <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
            <Badge variant="default">{typeLabels[order.type]}</Badge>
            <Badge
              variant={
                order.priority === "ACIL"
                  ? "danger"
                  : order.priority === "YUKSEK"
                  ? "warning"
                  : "default"
              }
            >
              {order.priority}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/teknik-servis/${order.id}/duzenle`}>
              Düzenle
            </Link>
          </Button>
        </div>
      </div>

      {/* Status workflow */}
      {nextStatuses.length > 0 && (
        <ServiceStatusActions orderId={order.id} nextStatuses={nextStatuses} statusLabels={statusLabels} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Servis Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Müşteri</p>
                  <Link
                    href={`/dashboard/musteriler/${order.customer.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {order.customer.name}
                    {order.customer.company && (
                      <span className="text-slate-500 font-normal"> · {order.customer.company}</span>
                    )}
                  </Link>
                </div>
                {order.assignedTo && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Atanan Teknisyen</p>
                    <p className="font-medium text-slate-900">{order.assignedTo.name}</p>
                  </div>
                )}
                {order.scheduledDate && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Planlanan Tarih/Saat</p>
                    <p className="font-medium text-slate-900">
                      {formatDateShort(order.scheduledDate)}
                      {order.scheduledTime ? ` ${order.scheduledTime}` : ""}
                    </p>
                  </div>
                )}
                {order.completedDate && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tamamlanma Tarihi</p>
                    <p className="font-medium text-emerald-700">{formatDateShort(order.completedDate)}</p>
                  </div>
                )}
                {order.location && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Konum</p>
                    <p className="font-medium text-slate-900">{order.location}</p>
                  </div>
                )}
              </div>
              {order.description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Açıklama</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{order.description}</p>
                </div>
              )}
              {order.customerNotes && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Müşteri Notları</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{order.customerNotes}</p>
                </div>
              )}
              {order.technicianNotes && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Teknisyen Notları</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 rounded-lg p-3">
                    {order.technicianNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Used Parts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Kullanılan Parçalar
              </CardTitle>
              <span className="text-sm text-slate-500">
                Toplam: {formatCurrency(totalPartsCost)}
              </span>
            </CardHeader>
            <CardContent>
              {order.usedParts.length > 0 ? (
                <div className="space-y-2">
                  {order.usedParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{part.product.name}</p>
                        <p className="text-xs text-slate-500">
                          {part.product.code} · {part.quantity} {part.product.unit} ×{" "}
                          {formatCurrency(part.product.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(part.quantity * part.product.unitPrice)}
                        </span>
                        {order.status !== "TAMAMLANDI" && order.status !== "IPTAL" && (
                          <RemoveServicePartButton
                            partId={part.id}
                            serviceOrderId={order.id}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Henüz parça eklenmedi.</p>
              )}

              {order.status !== "TAMAMLANDI" && order.status !== "IPTAL" && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-3">Parça Ekle</p>
                  <AddServicePartForm serviceOrderId={order.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Oluşturulma</span>
                <span className="font-medium">{formatDateShort(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Güncelleme</span>
                <span className="font-medium">{formatDateShort(order.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parça Sayısı</span>
                <span className="font-medium">{order.usedParts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parça Maliyeti</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalPartsCost)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
