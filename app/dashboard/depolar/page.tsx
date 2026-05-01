import Link from "next/link";
import { Plus, Warehouse } from "lucide-react";
import { getWarehouses } from "@/lib/actions/warehouse-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

export default async function DepolarPage() {
  const warehouses = await getWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Depo Yönetimi</h2>
          <p className="text-sm text-slate-500">
            Depoları ve stok dağılımını yönetin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/depolar/transfer">
              Transfer Oluştur
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/depolar/yeni">
              <Plus className="h-4 w-4" />
              Yeni Depo
            </Link>
          </Button>
        </div>
      </div>

      {warehouses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((warehouse) => {
            const totalItems = warehouse.stocks.reduce((sum, s) => sum + s.quantity, 0);
            const lowStockCount = warehouse.stocks.filter(
              (s) => s.quantity <= (s.product as { minStockLevel: number }).minStockLevel
            ).length;

            return (
              <Card
                key={warehouse.id}
                className="hover:border-orange-300 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <CardTitle className="text-base">{warehouse.name}</CardTitle>
                    </div>
                    <Badge variant={warehouse.type === "MERKEZ" ? "accent" : "default"}>
                      {warehouse.type === "MERKEZ" ? "Merkez" : "Araç"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {warehouse.responsible && (
                    <p className="text-sm text-slate-500">
                      Sorumlu: {warehouse.responsible}
                    </p>
                  )}
                  {warehouse.address && (
                    <p className="text-xs text-slate-400 line-clamp-1">{warehouse.address}</p>
                  )}
                  <div className="flex gap-4 pt-2 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{warehouse.stocks.length}</p>
                      <p className="text-xs text-slate-500">Ürün Çeşidi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{totalItems}</p>
                      <p className="text-xs text-slate-500">Toplam Adet</p>
                    </div>
                    {lowStockCount > 0 && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-rose-600">{lowStockCount}</p>
                        <p className="text-xs text-rose-500">Kritik Stok</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/dashboard/depolar/${warehouse.id}`}
                      className="flex-1 text-center rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      Detay
                    </Link>
                    <Link
                      href={`/dashboard/depolar/${warehouse.id}/duzenle`}
                      className="flex-1 text-center rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Düzenle
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Henüz depo yok"
          description="İlk deponuzu oluşturarak stok takibine başlayın."
        />
      )}

      {/* Quick link to transfer history */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/depolar/transfer/gecmis"
          className="text-sm text-orange-500 hover:underline"
        >
          Transfer Geçmişini Görüntüle →
        </Link>
      </div>
    </div>
  );
}
