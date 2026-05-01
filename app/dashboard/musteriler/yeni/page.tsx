import { CustomerForm } from "@/components/forms/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Müşteri</h2>
        <p className="text-sm text-slate-500">CRM portföyünüze yeni bir kayıt ekleyin.</p>
      </div>
      <CustomerForm />
    </div>
  );
}