import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import { ProductForm } from "@/components/forms/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Urun Duzenle</h2>
        <p className="text-sm text-slate-500">{product.name} urununu guncelleyin.</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
