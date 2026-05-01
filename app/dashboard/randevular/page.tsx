import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { getAppointments } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { CalendarView } from "@/components/appointments/calendar-view";

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  const events = appointments.map((a) => {
    const dateStr = new Date(a.date).toISOString().slice(0, 10);
    return {
      id: a.id,
      title: `${a.customer.name} - ${a.title}`,
      start: `${dateStr}T${a.startTime}`,
      end: `${dateStr}T${a.endTime}`,
      color: a.color ?? "#f97316",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Randevular</h2>
          <p className="text-sm text-slate-500">
            Takvim ve liste gorunumunde ziyaret planlamanizi yonetin.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/randevular/yeni">
            <Plus className="h-4 w-4" />
            Yeni Randevu
          </Link>
        </Button>
      </div>

      {/* FullCalendar */}
      <CalendarView events={events} />

      {/* List view */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tum Randevular</CardTitle>
          <CalendarDays className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          {appointments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Baslik</TableHead>
                  <TableHead>Musteri</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Konum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/randevular/${a.id}`}
                        className="font-semibold text-slate-900 hover:text-orange-600"
                      >
                        {a.title}
                      </Link>
                    </TableCell>
                    <TableCell>{a.customer.name}</TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>{formatDateShort(a.date)}</TableCell>
                    <TableCell>
                      {a.startTime} - {a.endTime}
                    </TableCell>
                    <TableCell>{a.location ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Randevu bulunamadi"
              description="Henuz randevu planlanmamis. Ilk randevuyu olusturun."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
