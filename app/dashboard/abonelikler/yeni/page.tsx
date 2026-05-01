import { getSelectOptions } from "@/lib/data";
import { SubscriptionForm } from "@/components/forms/subscription-form";

export default async function NewSubscriptionPage() {
  const { customers } = await getSelectOptions();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Abonelik</h2>
        <p className="text-sm text-slate-500">Müşteri için aylık veya yıllık abonelik oluşturun.</p>
      </div>
      <SubscriptionForm customers={customers} />
    </div>
  );
}
