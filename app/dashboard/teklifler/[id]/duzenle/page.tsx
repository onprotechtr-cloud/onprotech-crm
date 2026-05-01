import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQuoteById, getSelectOptions } from "@/lib/data";
import { QuoteForm } from "@/components/forms/quote-form";

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const [quote, { customers, products }] = await Promise.all([
    getQuoteById(params.id),
    getSelectOptions(),
  ]);

  if (!quote) notFound();

  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Teklif Duzenle</h2>
        <p className="text-sm text-slate-500">{quote.quoteNumber} numarali teklifi guncelleyin.</p>
      </div>
      <QuoteForm
        customers={customers}
        products={products}
        userId={session?.user.id ?? ""}
        quote={quote}
      />
    </div>
  );
}
