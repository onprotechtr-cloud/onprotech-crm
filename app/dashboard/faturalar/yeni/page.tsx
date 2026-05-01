import { auth } from "@/lib/auth";
import { getSelectOptions } from "@/lib/data";
import { InvoiceForm } from "@/components/forms/invoice-form";

export default async function NewInvoicePage() {
  const [session, { customers }] = await Promise.all([auth(), getSelectOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Fatura</h2>
        <p className="text-sm text-slate-500">Otomatik numaralı yeni bir fatura oluşturun.</p>
      </div>
      <InvoiceForm customers={customers} userId={session?.user?.id ?? ""} />
    </div>
  );
}
