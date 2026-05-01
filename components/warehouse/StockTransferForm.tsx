"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStockTransfer } from "@/lib/actions/warehouse-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WarehouseStock {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    code: string;
    unit: string;
    unitPrice: number;
  };
}

interface Warehouse {
  id: string;
  name: string;
  type: string;
  stocks: WarehouseStock[];
}

export function StockTransferForm({ warehouses }: { warehouses: Warehouse[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const fromWarehouse = warehouses.find((w) => w.id === fromId);
  const selectedStock = fromWarehouse?.stocks.find((s) => s.product.id === productId);
  const maxQty = selectedStock?.quantity ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !productId || !quantity) return;
    if (fromId === toId) {
      toast.error("Kaynak ve hedef depo aynı olamaz.");
      return;
    }

    startTransition(async () => {
      const result = await createStockTransfer({
        fromWarehouseId: fromId,
        toWarehouseId: toId,
        productId,
        quantity: parseFloat(quantity),
        notes: undefined,
      });

      if ("error" in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Transfer tamamlandı.");
        router.push("/dashboard/depolar/transfer/gecmis");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader><CardTitle>Transfer Bilgileri</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kaynak Depo *</label>
              <select
                value={fromId}
                onChange={(e) => { setFromId(e.target.value); setProductId(""); }}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Kaynak depo seçin...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hedef Depo *</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Hedef depo seçin...</option>
                {warehouses.filter((w) => w.id !== fromId).map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ürün *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={!fromId}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">Ürün seçin...</option>
              {(fromWarehouse?.stocks ?? []).map((s) => (
                <option key={s.product.id} value={s.product.id}>
                  {s.product.name} ({s.product.code}) — Mevcut: {s.quantity} {s.product.unit}
                </option>
              ))}
            </select>
            {fromId && (fromWarehouse?.stocks ?? []).length === 0 && (
              <p className="text-xs text-rose-500 mt-1">Bu depoda stok bulunmuyor.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Miktar *{selectedStock && ` (Max: ${maxQty} ${selectedStock.product.unit})`}
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              max={maxQty || undefined}
              step="0.01"
              required
              disabled={!productId}
              placeholder="Miktar girin"
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={isPending || !fromId || !toId || !productId || !quantity}>
          {isPending ? "Transfer yapılıyor..." : "Transferi Tamamla"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
      </div>
    </form>
  );
}
