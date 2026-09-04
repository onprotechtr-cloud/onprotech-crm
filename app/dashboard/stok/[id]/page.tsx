import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getProductById } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteProductButton } from "@/components/delete-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) notFound();

  const isLow = product.stockQuantity <= product.minStockLevel;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">{product.name}</h2>
          {isLow ? (
            <Badge variant="danger">Kritik Stok</Badge>
          ) : (
            <Badge variant="success">Stok Normal</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/stok/${product.id}/duzenle`}>
              <Pencil className="h-4 w-4" />
              Duzenle
            </Link>
          </Button>
          <DeleteProductButton id={product.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Urun Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {[
              ["Urun Kodu", product.code],
              ["Kategori", product.category ?? "-"],
              ["Birim", product.unit],
              ["Para Birimi", product.currency === "USD" ? "USD (Dolar)" : "TRY (Turk Lirasi)"],
              ["Birim Fiyat", formatCurrency(product.unitPrice, product.currency)],
              ["Aciklama", product.description ?? "-"],
              ["Kayit Tarihi", formatDate(product.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="font-medium text-slate-900">{label}</div>
                <div>{value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={isLow ? "border-rose-200" : ""}>
          <CardHeader>
            <CardTitle>Stok Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-semibold text-slate-900">
              {product.stockQuantity}
              <span className="ml-2 text-xl font-normal text-slate-500">{product.unit}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Minimum Seviye</span>
                <span className="font-medium">{product.minStockLevel} {product.unit}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${isLow ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{
                    width: `${Math.min(
                      100,
                      (product.stockQuantity / Math.max(product.minStockLevel * 2, 1)) * 100,
                    )}%`,
                  }}
                />
              </div>
              {isLow && (
                <p className="text-rose-600 font-medium">
                  Stok kritik seviyenin altinda! Siparis verilmesi onerilir.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Depo Dagilimi</h3>
                <span className="text-xs text-slate-500">
                  Toplam: {product.stockQuantity} {product.unit}
                </span>
              </div>
              {product.warehouseStocks?.length ? (
                <div className="space-y-2">
                  {product.warehouseStocks.map((ws) => (
                    <div
                      key={ws.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <Link
                        href={`/dashboard/depolar/${ws.warehouse.id}`}
                        className="font-medium text-slate-700 hover:text-orange-600"
                      >
                        {ws.warehouse.name}
                      </Link>
                      <span className="font-semibold text-slate-900">
                        {ws.quantity} {product.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Bu urun henuz hicbir depoda bulunmuyor.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
