"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createAppointmentAction, updateAppointmentAction } from "@/lib/actions/appointments";
import { appointmentSchema, type AppointmentInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/lib/utils";

type AppointmentFormProps = {
  customers: Array<{ id: string; name: string; company: string | null }>;
  userId: string;
  appointment?: Appointment | null;
};

export function AppointmentForm({ customers, userId, appointment }: AppointmentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: appointment?.title ?? "",
      customerId: appointment?.customerId ?? "",
      date: appointment ? new Date(appointment.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      startTime: appointment?.startTime ?? "09:00",
      endTime: appointment?.endTime ?? "10:00",
      location: appointment?.location ?? "",
      notes: appointment?.notes ?? "",
      status: appointment?.status ?? "PLANNED",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ""));
        const result = appointment ? await updateAppointmentAction(appointment.id, formData) : await createAppointmentAction(formData, userId);
        toast.success(result.message);
        router.push("/dashboard/randevular");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {fieldState.error ? <p className="text-sm text-rose-600">{fieldState.error.message}</p> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.company ? `- ${customer.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? <p className="text-sm text-rose-600">{fieldState.error.message}</p> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarih</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durum</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planlandı</SelectItem>
                      <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                      <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlangıç Saati</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bitiş Saati</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konum</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <Button disabled={pending} type="submit">
                {pending ? "Kaydediliyor..." : appointment ? "Randevuyu Güncelle" : "Randevu Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}