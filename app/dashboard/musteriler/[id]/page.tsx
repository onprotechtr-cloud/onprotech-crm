import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { getCustomerById } from "@/lib/data";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { AppointmentStatusBadge } from "@/components/appointment-status-badge";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { QuoteStatusBadge } from "@/components/quote-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{customer.name}</h2>
          <p className="text-sm text-slate-500">{customer.company ?? "Şirket bilgisi girilmedi."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/musteriler/${customer.id}/duzenle`}>
              <Edit className="h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <DeleteCustomerButton id={customer.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <div className="font-medium text-slate-900">E-posta</div>
              <div>{customer.email ?? "-"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Telefon</div>
              <div>{customer.phone ?? "-"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Şehir</div>
              <div>{customer.city ?? "-"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Adres</div>
              <div>{customer.address ?? "-"}</div>
            </div>
            <div>
              <div className="font-medium text-slate-900">Notlar</div>
              <div>{customer.notes ?? "Not bulunmuyor."}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İlişkili Teklifler</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.quotes.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teklif No</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Link href={`/dashboard/teklifler/${quote.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                          {quote.quoteNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell>{formatCurrency(quote.total)}</TableCell>
                      <TableCell>{formatDateShort(quote.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="Teklif yok" description="Bu müşteriye henüz teklif oluşturulmamış." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.appointments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <Link href={`/dashboard/randevular/${appointment.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                        {appointment.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell>{formatDateShort(appointment.date)}</TableCell>
                    <TableCell>
                      {appointment.startTime} - {appointment.endTime}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Randevu yok" description="Bu müşteri için henüz randevu planlanmadı." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}