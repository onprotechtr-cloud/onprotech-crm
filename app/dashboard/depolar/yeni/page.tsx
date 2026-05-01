import { WarehouseForm } from "@/components/warehouse/WarehouseForm";

export default function YeniDepoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Depo</h2>
        <p className="text-sm text-slate-500">Yeni bir depo veya araç deposu tanımlayın.</p>
      </div>
      <WarehouseForm />
    </div>
  );
}
