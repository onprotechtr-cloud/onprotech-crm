import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEmployee } from "@/lib/actions/personel-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PersonelDuzenlePage({ params }: { params: { id: string } }) {
  const employee = await prisma.employee.findUnique({ where: { id: params.id } });

  if (!employee) {
    notFound();
  }

  const updateWithId = updateEmployee.bind(null, params.id);

  const toInputDate = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Personel Düzenle</h2>
        <p className="text-sm text-slate-500">
          {employee.firstName} {employee.lastName} kaydını güncelleyin.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personel Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ad *</label>
              <input
                name="firstName"
                required
                defaultValue={employee.firstName}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Soyad *</label>
              <input
                name="lastName"
                required
                defaultValue={employee.lastName}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-posta</label>
              <input
                name="email"
                type="email"
                defaultValue={employee.email ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input
                name="phone"
                defaultValue={employee.phone ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Departman *</label>
              <input
                name="department"
                required
                defaultValue={employee.department}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Pozisyon *</label>
              <input
                name="position"
                required
                defaultValue={employee.position}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">İşe Başlama Tarihi</label>
              <input
                name="startDate"
                type="date"
                defaultValue={toInputDate(employee.startDate)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Maaş</label>
              <input
                name="salary"
                type="number"
                step="0.01"
                defaultValue={employee.salary ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Maaş Periyodu</label>
              <select
                name="salaryPeriod"
                defaultValue={employee.salaryPeriod}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="AYLIK">Aylık</option>
                <option value="YILLIK">Yıllık</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Durum</label>
              <select
                name="status"
                defaultValue={employee.status}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="AKTIF">Aktif</option>
                <option value="IZINLI">İzinli</option>
                <option value="AYRILDI">Ayrıldı</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Adres</label>
              <input
                name="address"
                defaultValue={employee.address ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Acil Durum Kişisi</label>
              <input
                name="emergencyContact"
                defaultValue={employee.emergencyContact ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Acil Durum Telefonu</label>
              <input
                name="emergencyPhone"
                defaultValue={employee.emergencyPhone ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notlar</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={employee.notes ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Değişiklikleri Kaydet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
