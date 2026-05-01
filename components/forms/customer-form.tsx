"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Customer } from "@prisma/client";
import { createCustomerAction, updateCustomerAction } from "@/lib/actions/customers";
import { customerSchema, type CustomerInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils";

export function CustomerForm({ customer }: { customer?: Customer | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      company: customer?.company ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      address: customer?.address ?? "",
      city: customer?.city ?? "",
      notes: customer?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => formData.append(key, value ?? ""));
        const result = customer ? await updateCustomerAction(customer.id, formData) : await createCustomerAction(formData);
        toast.success(result.message);
        router.push(customer ? `/dashboard/musteriler/${customer.id}` : "/dashboard/musteriler");
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
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {fieldState.error ? <p className="text-sm text-rose-600">{fieldState.error.message}</p> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şirket</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  {fieldState.error ? <p className="text-sm text-rose-600">{fieldState.error.message}</p> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {fieldState.error ? <p className="text-sm text-rose-600">{fieldState.error.message}</p> : null}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şehir</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
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
                {pending ? "Kaydediliyor..." : customer ? "Değişiklikleri Kaydet" : "Müşteriyi Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}