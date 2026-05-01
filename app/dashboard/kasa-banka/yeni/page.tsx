import { CashAccountForm } from "@/components/forms/cash-account-form";

export default function NewCashAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Hesap</h2>
        <p className="text-sm text-slate-500">Yeni bir kasa veya banka hesabı oluşturun.</p>
      </div>
      <CashAccountForm />
    </div>
  );
}
