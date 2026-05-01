import { notFound } from "next/navigation";
import Link from "next/link";
import { getWarehouseById } from "@/lib/actions/warehouse-actions";
import { getStockTransfers } from "@/lib/actions/warehouse-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { formatDateShort } from "@/lib/utils";

export default async function DepoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [warehouse, transfers] = await Promise.all([
    getWarehouseById(params.id),
    getStockTransfers({ warehouseId: params.id }),
  ]);

  if (!warehouse) notFound();

  const totalItems = warehouse.stocks.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1">
            <Link href="/dashboard/depolar" className="text-sm text-slate-500 hover:text-orange-500">
              ← Depolar
            </Link>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">{warehouse.name}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={warehouse.type === "MERKEZ" ? "accent" : "default"}>
              {warehouse.type === "MERKEZ" ? "Merkez Depo" : "Araç Deposu"}
            </Badge>
            {!warehouse.isActive && <Badge variant="danger">Pasif</Badge>}
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/depolar/${warehouse.id}/duzenle`}>Düzenle</Link>
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-slate-900">{warehouse.stocks.length}</p>
            <p className="text-sm text-slate-500 mt-1">Ürün Çeşidi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
            <p className="text-sm text-slate-500 mt-1">Toplam Miktar</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-slate-900">{transfers.length}</p>
            <p className="text-sm text-slate-500 mt-1">Transfer Kaydı</p>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Info */}
      {(warehouse.responsible || warehouse.address || warehouse.description) && (
        <Card>
          <CardHeader><CardTitle>Depo Bilgileri</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            {warehouse.responsible && (
              <div>
                <p className="text-xs text-slate-500">Sorumlu</p>
                <p className="font-medium text-slate-900">{warehouse.responsible}</p>
              </div>
            )}
            {warehouse.address && (
              <div>
                <p className="text-xs text-slate-500">Adres</p>
                <p className="font-medium text-slate-900">{warehouse.address}</p>
              </div>
            )}
            {warehouse.description && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Açıklama</p>
                <p className="font-medium text-slate-900">{warehouse.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stok Listesi</CardTitle>
          <Button asChild size="sm">
            <Link href="/dashboard/depolar/transfer">Transfer Oluştur</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {warehouse.stocks.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouse.stocks.map((stock) => {
                  const isLow = stock.quantity <= (stock.product as { minStockLevel: number }).minStockLevel;
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/stok/${stock.product.id}`}
                          className="hover:text-orange-600"
                        >
                          {stock.product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {stock.product.code}
                      </TableCell>
                      <TableCell>
                        <span className={isLow ? "text-rose-600 font-semibold" : ""}>
                          {stock.quantity} {stock.product.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="danger">Kritik</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Bu depoda stok yok" description="Stok transferi yaparak depoyu doldurun." />
          )}
        </CardContent>
      </Card>

      {/* Transfer history */}
      {transfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Son Transferler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transfers.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-slate-500">{t.transferNumber}</span>
                    <p className="font-medium text-slate-900">{t.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.fromWarehouse.name} → {t.toWarehouse.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {t.quantity} {t.product.unit}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateShort(t.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            {transfers.length > 10 && (
              <Link
                href="/dashboard/depolar/transfer/gecmis"
                className="mt-3 block text-center text-sm text-orange-500 hover:underline"
              >
                Tüm Transferleri Görüntüle ({transfers.length})
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
