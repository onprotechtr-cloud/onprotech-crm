import { notFound } from "next/navigation";
import { getSubscriptionById } from "@/lib/actions/subscription-actions";
import { getSelectOptions } from "@/lib/data";
import { SubscriptionForm } from "@/components/forms/subscription-form";

export default async function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const [sub, { customers }] = await Promise.all([getSubscriptionById(params.id), getSelectOptions()]);
  if (!sub) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Abonelik Düzenle</h2>
        <p className="text-sm text-slate-500">{sub.planName} aboneliğini düzenleyin.</p>
      </div>
      <SubscriptionForm customers={customers} subscription={sub} />
    </div>
  );
}
