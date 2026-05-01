"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateServiceOrderStatus } from "@/lib/actions/service-actions";
import { ServiceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

const nextStatusBtnStyle: Record<string, string> = {
  ATANDI: "bg-orange-500 hover:bg-orange-600 text-white",
  YOLDA: "bg-amber-500 hover:bg-amber-600 text-white",
  BASLADIM: "bg-blue-500 hover:bg-blue-600 text-white",
  TAMAMLANDI: "bg-emerald-500 hover:bg-emerald-600 text-white",
  IPTAL: "bg-rose-500 hover:bg-rose-600 text-white",
};

export function ServiceStatusActions({
  orderId,
  nextStatuses,
  statusLabels,
}: {
  orderId: string;
  nextStatuses: string[];
  statusLabels: Record<string, string>;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatus = (status: string) => {
    startTransition(async () => {
      const result = await updateServiceOrderStatus(orderId, status as ServiceStatus);
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success(`Durum güncellendi: ${statusLabels[status]}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-sm text-slate-500 mr-2">Durumu güncelle:</span>
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleStatus(status)}
          disabled={isPending}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${nextStatusBtnStyle[status] ?? "bg-slate-200 text-slate-700"}`}
        >
          → {statusLabels[status]}
        </button>
      ))}
    </div>
  );
}
