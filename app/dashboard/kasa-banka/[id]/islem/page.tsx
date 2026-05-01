import { notFound } from "next/navigation";
import { getCashAccountById } from "@/lib/actions/cashbank-actions";
import { TransactionForm } from "@/components/forms/transaction-form";

export default async function NewTransactionPage({ params }: { params: { id: string } }) {
  const account = await getCashAccountById(params.id);
  if (!account) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni İşlem</h2>
        <p className="text-sm text-slate-500">{account.name} hesabına gelir veya gider kaydı ekleyin.</p>
      </div>
      <TransactionForm accountId={account.id} accountName={account.name} currency={account.currency} />
    </div>
  );
}
