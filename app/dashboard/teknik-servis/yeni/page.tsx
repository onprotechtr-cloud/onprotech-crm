import { getTechnicians } from "@/lib/actions/service-actions";
import { getCustomers } from "@/lib/data";
import { NewServiceOrderForm } from "@/components/service/ServiceOrderForm";

export default async function YeniServisPage() {
  const [customers, technicians] = await Promise.all([
    getCustomers(),
    getTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Servis Emri</h2>
        <p className="text-sm text-slate-500">Yeni bir teknik servis emri oluşturun.</p>
      </div>
      <NewServiceOrderForm customers={customers} technicians={technicians} />
    </div>
  );
}
