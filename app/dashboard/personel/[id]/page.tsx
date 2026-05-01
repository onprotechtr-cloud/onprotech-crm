import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { createLeaveRequest, createAttendance, updateLeaveStatus, deleteEmployee } from "@/lib/actions/personel-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabel: Record<string, string> = {
  AKTIF: "Aktif",
  IZINLI: "İzinli",
  AYRILDI: "Ayrıldı",
};

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  AKTIF: "success",
  IZINLI: "warning",
  AYRILDI: "danger",
};

const leaveTypeLabel: Record<string, string> = {
  YILLIK_IZIN: "Yıllık İzin",
  HASTALIK: "Hastalık",
  MAZERET: "Mazeret",
  DIGER: "Diğer",
};

const leaveStatusLabel: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  REDDEDILDI: "Reddedildi",
};

const leaveStatusVariant: Record<string, "default" | "success" | "danger"> = {
  BEKLEMEDE: "default",
  ONAYLANDI: "success",
  REDDEDILDI: "danger",
};

const attendanceStatusLabel: Record<string, string> = {
  NORMAL: "Normal",
  GEC_KALMA: "Geç Kalma",
  ERKEN_CIKIS: "Erken Çıkış",
  IZINLI: "İzinli",
};

export default async function PersonelDetayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      attendance: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!employee) {
    notFound();
  }

  const createLeaveWithId = createLeaveRequest.bind(null, params.id);
  const createAttendanceWithId = createAttendance.bind(null, params.id);

  const sessionUserId = (session?.user as { id?: string })?.id ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-sm text-slate-500">
            {employee.department} · {employee.position}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/personel/${params.id}/duzenle`}>
              <Edit className="h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <form
            action={async () => {
              "use server";
              await deleteEmployee(params.id);
            }}
          >
            <Button type="submit" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
              Sil
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personel Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium text-slate-900">Durum</span>
              <Badge variant={statusVariant[employee.status] ?? "default"}>
                {statusLabel[employee.status] ?? employee.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-900">E-posta</span>
              <span>{employee.email ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-900">Telefon</span>
              <span>{employee.phone ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-900">İşe Başlama</span>
              <span>{formatDateShort(employee.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-900">Maaş</span>
              <span>
                {employee.salary
                  ? `${formatCurrency(employee.salary)} / ${employee.salaryPeriod === "AYLIK" ? "Ay" : "Yıl"}`
                  : "-"}
              </span>
            </div>
            {employee.address && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-900">Adres</span>
                <span className="text-right max-w-xs">{employee.address}</span>
              </div>
            )}
            {employee.emergencyContact && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-900">Acil Durum</span>
                <span>
                  {employee.emergencyContact}
                  {employee.emergencyPhone ? ` · ${employee.emergencyPhone}` : ""}
                </span>
              </div>
            )}
            {employee.notes && (
              <div>
                <span className="font-medium text-slate-900">Notlar</span>
                <p className="mt-1 text-slate-500">{employee.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle>Yoklama Girişi</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAttendanceWithId} className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Tarih *</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Durum</label>
                <select
                  name="status"
                  defaultValue="NORMAL"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="GEC_KALMA">Geç Kalma</option>
                  <option value="ERKEN_CIKIS">Erken Çıkış</option>
                  <option value="IZINLI">İzinli</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Giriş Saati</label>
                <input
                  name="checkIn"
                  type="time"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Çıkış Saati</label>
                <input
                  name="checkOut"
                  type="time"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-700">Not</label>
                <input
                  name="notes"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" size="sm">Yoklama Kaydet</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Quick Leave Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>İzin Talebi Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLeaveWithId} className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">İzin Türü *</label>
              <select
                name="type"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="YILLIK_IZIN">Yıllık İzin</option>
                <option value="HASTALIK">Hastalık</option>
                <option value="MAZERET">Mazeret</option>
                <option value="DIGER">Diğer</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Başlangıç *</label>
              <input
                name="startDate"
                type="date"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Bitiş *</label>
              <input
                name="endDate"
                type="date"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Toplam Gün *</label>
              <input
                name="totalDays"
                type="number"
                min="1"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Açıklama</label>
              <input
                name="reason"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div className="md:col-span-3 lg:col-span-5">
              <Button type="submit" size="sm">İzin Talebi Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>İzin Talepleri</CardTitle>
        </CardHeader>
        <CardContent>
          {employee.leaveRequests.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tür</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Gün</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.leaveRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leaveTypeLabel[leave.type] ?? leave.type}</TableCell>
                    <TableCell>{formatDateShort(leave.startDate)}</TableCell>
                    <TableCell>{formatDateShort(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <Badge variant={leaveStatusVariant[leave.status] ?? "default"}>
                        {leaveStatusLabel[leave.status] ?? leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {leave.status === "BEKLEMEDE" && (
                        <div className="flex gap-2">
                          <form
                            action={async () => {
                              "use server";
                              await updateLeaveStatus(leave.id, "ONAYLANDI", sessionUserId);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                            >
                              Onayla
                            </button>
                          </form>
                          <form
                            action={async () => {
                              "use server";
                              await updateLeaveStatus(leave.id, "REDDEDILDI", sessionUserId);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                            >
                              Reddet
                            </button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-slate-500">Henüz izin talebi bulunmuyor.</p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle>Yoklama Kaydı</CardTitle>
        </CardHeader>
        <CardContent>
          {employee.attendance.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Giriş</TableHead>
                  <TableHead>Çıkış</TableHead>
                  <TableHead>Toplam Saat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Not</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.attendance.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell>{formatDateShort(att.date)}</TableCell>
                    <TableCell>{att.checkIn ?? "-"}</TableCell>
                    <TableCell>{att.checkOut ?? "-"}</TableCell>
                    <TableCell>
                      {att.totalHours != null ? `${att.totalHours.toFixed(1)} saat` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {attendanceStatusLabel[att.status] ?? att.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{att.notes ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-slate-500">Henüz yoklama kaydı bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
