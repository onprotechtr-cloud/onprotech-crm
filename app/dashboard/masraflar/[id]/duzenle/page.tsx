import { notFound } from "next/navigation";
import { getExpenseById, getExpenseCategories } from "@/lib/actions/expense-actions";
import { ExpenseForm } from "@/components/forms/expense-form";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const [expense, categories] = await Promise.all([getExpenseById(params.id), getExpenseCategories()]);
  if (!expense) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Masraf Düzenle</h2>
        <p className="text-sm text-slate-500">{expense.title} masrafını düzenleyin.</p>
      </div>
      <ExpenseForm categories={categories} expense={expense} />
    </div>
  );
}
