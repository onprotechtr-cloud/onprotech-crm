"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addServicePart } from "@/lib/actions/service-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
}

export function AddServicePartForm({ serviceOrderId }: { serviceOrderId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const loadProducts = async () => {
    if (loaded) return;
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoaded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) return;

    startTransition(async () => {
      const result = await addServicePart({
        serviceOrderId,
        productId: selectedProduct,
        quantity: parseFloat(quantity),
      });

      if ("error" in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Parça eklendi ve stoktan düşüldü.");
        setSelectedProduct("");
        setQuantity("1");
        router.refresh();
      }
    });
  };

  const selected = products.find((p) => p.id === selectedProduct);

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end">
      <div className="flex-1 min-w-48">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          onFocus={loadProducts}
          required
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          <option value="">Ürün seçin...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code}) — Stok: {p.stockQuantity} {p.unit}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Adet"
          required
        />
      </div>
      {selected && (
        <span className="text-xs text-slate-500 self-center">
          {selected.unit}
        </span>
      )}
      <Button type="submit" disabled={isPending || !selectedProduct} size="sm">
        {isPending ? "Ekleniyor..." : "Ekle"}
      </Button>
    </form>
  );
}
