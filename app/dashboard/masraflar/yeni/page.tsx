import { getExpenseCategories } from "@/lib/actions/expense-actions";
import { ExpenseForm } from "@/components/forms/expense-form";

export default async function NewExpensePage() {
  const categories = await getExpenseCategories();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Masraf</h2>
        <p className="text-sm text-slate-500">Yeni bir masraf kaydı oluşturun.</p>
      </div>
      <ExpenseForm categories={categories} />
    </div>
  );
}
