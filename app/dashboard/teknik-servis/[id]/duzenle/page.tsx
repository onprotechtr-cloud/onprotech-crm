import { notFound } from "next/navigation";
import { getServiceOrderById, getTechnicians } from "@/lib/actions/service-actions";
import { getCustomers } from "@/lib/data";
import { EditServiceOrderForm } from "@/components/service/ServiceOrderForm";

export default async function DuzenleServisPage({
  params,
}: {
  params: { id: string };
}) {
  const [order, customers, technicians] = await Promise.all([
    getServiceOrderById(params.id),
    getCustomers(),
    getTechnicians(),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Servis Emri Düzenle</h2>
        <p className="text-sm text-slate-500">{order.orderNumber} — {order.title}</p>
      </div>
      <EditServiceOrderForm order={order} customers={customers} technicians={technicians} />
    </div>
  );
}
