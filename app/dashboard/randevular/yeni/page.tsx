import { auth } from "@/lib/auth";
import { getSelectOptions } from "@/lib/data";
import { AppointmentForm } from "@/components/forms/appointment-form";

export default async function NewAppointmentPage() {
  const [session, { customers }] = await Promise.all([auth(), getSelectOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Randevu</h2>
        <p className="text-sm text-slate-500">Takvime yeni bir ziyaret veya toplanti ekleyin.</p>
      </div>
      <AppointmentForm customers={customers} userId={session?.user.id ?? ""} />
    </div>
  );
}
