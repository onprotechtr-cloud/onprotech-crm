import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getAppointmentById } from "@/lib/data";
import { formatDate, formatDateShort } from "@/lib/utils";
import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = await getAppointmentById(params.id);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              {appointment.title}
            </h2>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-sm text-slate-500">{appointment.customer.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/randevular/${appointment.id}/duzenle`}>
            <Pencil className="h-4 w-4" />
            Duzenle
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Randevu Detaylari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <div className="font-medium text-slate-900">Musteri</div>
              <div>{appointment.customer.name}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Tarih</div>
              <div>{formatDate(appointment.date)}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Saat</div>
              <div>
                {appointment.startTime} - {appointment.endTime}
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Konum</div>
              <div>{appointment.location ?? "-"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Sorumlular</div>
              <div>{appointment.user.name}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {appointment.notes ?? "Bu randevu icin not girilmemis."}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
