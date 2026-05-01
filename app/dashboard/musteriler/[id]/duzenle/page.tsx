import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/data";
import { CustomerForm } from "@/components/forms/customer-form";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Müşteri Düzenle</h2>
        <p className="text-sm text-slate-500">{customer.name} kaydını güncelleyin.</p>
      </div>
      <CustomerForm customer={customer} />
    </div>
  );
}