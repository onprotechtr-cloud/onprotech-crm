import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/actions/invoice-actions";
import { getSelectOptions } from "@/lib/data";
import { auth } from "@/lib/auth";
import { InvoiceForm } from "@/components/forms/invoice-form";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const [invoice, { customers }, session] = await Promise.all([
    getInvoiceById(params.id),
    getSelectOptions(),
    auth(),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Fatura Düzenle</h2>
        <p className="text-sm text-slate-500">{invoice.invoiceNumber} numaralı faturayı düzenleyin.</p>
      </div>
      <InvoiceForm customers={customers} userId={session?.user?.id ?? ""} invoice={invoice} />
    </div>
  );
}
