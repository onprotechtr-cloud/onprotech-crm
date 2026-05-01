import { auth } from "@/lib/auth";
import { getSelectOptions } from "@/lib/data";
import { QuoteForm } from "@/components/forms/quote-form";

export default async function NewQuotePage() {
  const [session, { customers, products }] = await Promise.all([
    auth(),
    getSelectOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Teklif</h2>
        <p className="text-sm text-slate-500">
          Otomatik numarali profesyonel teklif olusturun.
        </p>
      </div>
      <QuoteForm
        customers={customers}
        products={products}
        userId={session?.user.id ?? ""}
      />
    </div>
  );
}
