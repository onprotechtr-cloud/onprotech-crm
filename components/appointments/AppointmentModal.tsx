"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, AppointmentFormData } from "@/lib/validations/appointment";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/actions/appointment-actions";
import { toast } from "sonner";
import { X, Trash2, MapPin, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: {
      status: string;
      location?: string | null;
      notes?: string | null;
      customerName?: string | null;
      customerCompany?: string | null;
    };
  } | null;
  defaultDate?: string;
  customers: { id: string; name: string; company: string | null }[];
}

function extractDate(dt: string) {
  return dt.split("T")[0];
}

function extractTime(dt: string) {
  if (!dt.includes("T")) return "09:00";
  return dt.split("T")[1].substring(0, 5);
}

export default function AppointmentModal({
  isOpen,
  onClose,
  event,
  defaultDate,
  customers,
}: AppointmentModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setViewMode(true);
        reset({
          title: event.title,
          customerId: "",
          date: extractDate(event.start),
          startTime: extractTime(event.start),
          endTime: extractTime(event.end),
          location: event.extendedProps.location ?? "",
          status: event.extendedProps.status as AppointmentFormData["status"],
          notes: event.extendedProps.notes ?? "",
        });
      } else {
        setViewMode(false);
        reset({
          title: "",
          customerId: "",
          date: defaultDate ?? new Date().toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "10:00",
          location: "",
          status: "PLANNED",
          notes: "",
        });
      }
    }
  }, [isOpen, event, defaultDate, reset]);

  async function onSubmit(data: AppointmentFormData) {
    const result = event
      ? await updateAppointment(event.id, data)
      : await createAppointment(data);

    if (result.error) {
      toast.error("Bir hata oluştu.");
      return;
    }

    toast.success(event ? "Randevu güncellendi" : "Randevu oluşturuldu");
    onClose();
    router.refresh();
  }

  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    await deleteAppointment(event.id);
    toast.success("Randevu silindi");
    setDeleting(false);
    onClose();
    router.refresh();
  }

  if (!isOpen) return null;

  const statusLabels: Record<string, string> = {
    PLANNED: "Planlandı",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal",
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {event && viewMode
              ? "Randevu Detayı"
              : event
              ? "Randevu Düzenle"
              : "Yeni Randevu"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {event && viewMode ? (
          <div className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">{event.title}</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-gray-400" />
                {extractDate(event.start)} · {extractTime(event.start)}–{extractTime(event.end)}
              </div>
              {event.extendedProps.customerName && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={14} className="text-gray-400" />
                  {event.extendedProps.customerName}
                  {event.extendedProps.customerCompany && ` · ${event.extendedProps.customerCompany}`}
                </div>
              )}
              {event.extendedProps.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {event.extendedProps.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {statusLabels[event.extendedProps.status] ?? event.extendedProps.status}
                </span>
              </div>
              {event.extendedProps.notes && (
                <p className="text-gray-500 text-xs bg-gray-50 p-3 rounded-lg">
                  {event.extendedProps.notes}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewMode(false)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
              >
                {deleting ? "..." : <Trash2 size={15} />}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Randevu başlığı"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
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
                Tarih <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                <input
                  type="time"
                  {...register("startTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                <input
                  type="time"
                  {...register("endTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
              <input
                {...register("location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Toplantı yeri"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PLANNED">Planlandı</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? "Kaydediliyor..." : event ? "Güncelle" : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
