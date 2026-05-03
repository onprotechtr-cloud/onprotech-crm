import Link from "next/link";
import { AlertTriangle, Package, Plus } from "lucide-react";
import { getProducts, getLowStockProducts } from "@/lib/data";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";

export default async function StokPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const [products, lowStock] = await Promise.all([
    getProducts(searchParams.q),
    getLowStockProducts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Stok Yonetimi</h2>
          <p className="text-sm text-slate-500">
            Urun katalogu ve stok seviyelerini buradan takip edin.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/stok/yeni">
            <Plus className="h-4 w-4" />
            Yeni Urun
          </Link>
        </Button>
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">
              Kritik Stok Uyarisi ({lowStock.length} urun)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/stok/${p.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm hover:bg-amber-100"
              >
                <Package className="h-3.5 w-3.5" />
                {p.name}: {p.stockQuantity} / {p.minStockLevel} {p.unit}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-5">
          <form className="flex gap-3">
            <Input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Ad, kod veya kategori ara"
              className="flex-1"
            />
            <Button type="submit">Ara</Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      {products.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Urun Listesi ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="mobile-card-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Urun</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>Toplam Stok</TableHead>
                  <TableHead>Depo Dagilimi</TableHead>
                  <TableHead>Min. Stok</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockLevel;
                  return (
                    <TableRow key={p.id}>
                      <TableCell data-label="Urun">
                        <Link
                          href={`/dashboard/stok/${p.id}`}
                          className="font-semibold text-slate-900 hover:text-orange-600"
                        >
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell data-label="Kod" className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell data-label="Kategori">{p.category ?? "-"}</TableCell>
                      <TableCell data-label="Birim Fiyat">{formatCurrency(p.unitPrice, p.currency)}</TableCell>
                      <TableCell data-label="Toplam Stok">
                        <span className={isLow ? "font-semibold text-rose-600" : ""}>
                          {p.stockQuantity} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell data-label="Depo Dagilimi">
                        {p.warehouseStocks?.length > 0 ? (
                          <div className="flex flex-col gap-1 text-xs">
                            {p.warehouseStocks.map((ws) => (
                              <span key={ws.warehouseId} className="text-slate-600">
                                <span className="font-medium">{ws.warehouse.name}:</span> {ws.quantity} {p.unit}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell data-label="Min. Stok">
                        {p.minStockLevel} {p.unit}
                      </TableCell>
                      <TableCell data-label="Durum">
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
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Urun bulunamadi"
          description="Arama kriterini degistirin veya yeni bir urun ekleyin."
        />
      )}
    </div>
  );
}
