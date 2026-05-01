import { notFound } from "next/navigation";
import { getAppointmentById, getSelectOptions } from "@/lib/data";
import { AppointmentForm } from "@/components/forms/appointment-form";

export default async function EditAppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const [appointment, { customers }] = await Promise.all([
    getAppointmentById(params.id),
    getSelectOptions(),
  ]);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Randevu Duzenle</h2>
        <p className="text-sm text-slate-500">{appointment.title} randevusunu guncelleyin.</p>
      </div>
      <AppointmentForm
        customers={customers}
        userId={appointment.userId}
        appointment={appointment}
      />
    </div>
  );
}
