import { notFound } from "next/navigation";
import { getWarehouseById } from "@/lib/actions/warehouse-actions";
import { WarehouseForm } from "@/components/warehouse/WarehouseForm";

export default async function DuzenleDepoPage({
  params,
}: {
  params: { id: string };
}) {
  const warehouse = await getWarehouseById(params.id);
  if (!warehouse) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Depo Düzenle</h2>
        <p className="text-sm text-slate-500">{warehouse.name}</p>
      </div>
      <WarehouseForm warehouse={warehouse} />
    </div>
  );
}
