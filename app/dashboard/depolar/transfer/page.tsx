import { getWarehouses } from "@/lib/actions/warehouse-actions";
import { StockTransferForm } from "@/components/warehouse/StockTransferForm";

export default async function TransferPage() {
  const warehouses = await getWarehouses();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Stok Transferi</h2>
        <p className="text-sm text-slate-500">Depolar arası ürün transferi gerçekleştirin.</p>
      </div>
      <StockTransferForm warehouses={warehouses} />
    </div>
  );
}
