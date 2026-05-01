import { ProductForm } from "@/components/forms/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Urun</h2>
        <p className="text-sm text-slate-500">Stok katalogunuza yeni bir urun ekleyin.</p>
      </div>
      <ProductForm />
    </div>
  );
}
