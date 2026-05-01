"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, QuoteFormData } from "@/lib/validations/quote";
import { createQuote, updateQuote } from "@/lib/actions/quote-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, roundMoney } from "@/lib/utils";
import { useEffect } from "react";

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface QuoteFormProps {
  customers: Customer[];
  defaultCustomerId?: string;
  quote?: {
    id: string;
    customerId: string;
    date: string;
    validUntil: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
    taxRate: number;
    discount: number;
    notes: string;
    items: {
      productName: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
      order: number;
    }[];
  };
}

function toInputDate(dateStr: string): string {
  // Converts "DD.MM.YYYY" or ISO to "YYYY-MM-DD"
  if (dateStr.includes("-") && dateStr.length === 10) return dateStr;
  if (dateStr.includes(".")) {
    const [d, m, y] = dateStr.split(".");
    return `${y}-${m}-${d}`;
  }
  return new Date(dateStr).toISOString().split("T")[0];
}

function defaultValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

export default function QuoteForm({ customers, defaultCustomerId, quote }: QuoteFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerId: quote?.customerId ?? defaultCustomerId ?? "",
      date: quote ? toInputDate(quote.date) : new Date().toISOString().split("T")[0],
      validUntil: quote ? toInputDate(quote.validUntil) : defaultValidUntil(),
      status: quote?.status ?? "DRAFT",
      taxRate: quote?.taxRate ?? 20,
      discount: quote?.discount ?? 0,
      notes: quote?.notes ?? "",
      items: quote?.items ?? [
        { productName: "", description: "", quantity: 1, unit: "adet", unitPrice: 0, total: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });
  const taxRate = watch("taxRate");
  const discount = watch("discount");

  // Her kalem değiştiğinde satır toplamını güncelle
  useEffect(() => {
    watchedItems.forEach((item, idx) => {
      const total = roundMoney((item.quantity ?? 0) * (item.unitPrice ?? 0));
      setValue(`items.${idx}.total`, total);
    });
  }, [watchedItems, setValue]);

  const subtotal = roundMoney(
    (watchedItems ?? []).reduce((s, i) => s + (i.quantity ?? 0) * (i.unitPrice ?? 0), 0)
  );
  const discountedSubtotal = roundMoney(subtotal - (discount ?? 0));
  const taxAmount = roundMoney((discountedSubtotal * (taxRate ?? 0)) / 100);
  const total = roundMoney(discountedSubtotal + taxAmount);

  async function onSubmit(data: QuoteFormData) {
    const result = quote
      ? await updateQuote(quote.id, data)
      : await createQuote(data);

    if (result.error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      return;
    }

    toast.success(quote ? "Teklif güncellendi" : "Teklif oluşturuldu");
    router.push("/teklifler");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Temel Bilgiler */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Teklif Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri <span className="text-red-500">*</span>
            </label>
            <select
              {...register("customerId")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Müşteri seçin...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ""}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-red-500 mt-1">{errors.customerId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teklif Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geçerlilik <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("validUntil")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="DRAFT">Taslak</option>
              <option value="SENT">Gönderildi</option>
              <option value="ACCEPTED">Kabul Edildi</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KDV (%)</label>
            <input
              type="number"
              {...register("taxRate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İndirim (₺)</label>
            <input
              type="number"
              {...register("discount")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Teklif notları..."
          />
        </div>
      </div>

      {/* Ürün Kalemleri */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Teklif Kalemleri</h2>
          <button
            type="button"
            onClick={() =>
              append({ productName: "", description: "", quantity: 1, unit: "adet", unitPrice: 0, total: 0 })
            }
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus size={16} />
            Kalem Ekle
          </button>
        </div>

        {errors.items && !Array.isArray(errors.items) && (
          <div className="px-5 py-2 bg-red-50 text-red-600 text-sm">
            {errors.items.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-[30%]">Ürün / Hizmet</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-[20%]">Açıklama</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600 w-[10%]">Miktar</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-[8%]">Birim</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600 w-[15%]">Birim Fiyat</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600 w-[12%]">Toplam</th>
                <th className="w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, idx) => {
                const lineTotal = roundMoney(
                  (watchedItems?.[idx]?.quantity ?? 0) * (watchedItems?.[idx]?.unitPrice ?? 0)
                );
                return (
                  <tr key={field.id}>
                    <td className="px-4 py-2">
                      <input
                        {...register(`items.${idx}.productName`)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Ürün adı"
                      />
                      {errors.items?.[idx]?.productName && (
                        <p className="text-xs text-red-500 mt-0.5">
                          {errors.items[idx]?.productName?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        {...register(`items.${idx}.description`)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Açıklama"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${idx}.quantity`)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        {...register(`items.${idx}.unit`)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${idx}.unitPrice`)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(lineTotal)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Toplam Özeti */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-end">
            <dl className="space-y-1.5 w-64 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Ara Toplam</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              {(discount ?? 0) > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>İndirim</dt>
                  <dd>- {formatCurrency(discount ?? 0)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">KDV (%{taxRate})</dt>
                <dd>{formatCurrency(taxAmount)}</dd>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <dt>Genel Toplam</dt>
                <dd className="text-orange-600">{formatCurrency(total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {isSubmitting ? "Kaydediliyor..." : quote ? "Teklifi Güncelle" : "Teklif Oluştur"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
