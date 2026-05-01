"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus } from "@/lib/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@prisma/client";

const transitions: Record<string, Array<{ status: InvoiceStatus; label: string; variant: "default" | "outline" | "destructive" }>> = {
  TASLAK: [
    { status: "GONDERILDI", label: "Gönderildi Olarak İşaretle", variant: "default" },
    { status: "IPTAL", label: "İptal Et", variant: "destructive" },
  ],
  GONDERILDI: [
    { status: "ODENDI", label: "Ödendi Olarak İşaretle", variant: "default" },
    { status: "GECIKTI", label: "Gecikmiş Olarak İşaretle", variant: "outline" },
    { status: "IPTAL", label: "İptal Et", variant: "destructive" },
  ],
  GECIKTI: [
    { status: "ODENDI", label: "Ödendi Olarak İşaretle", variant: "default" },
    { status: "IPTAL", label: "İptal Et", variant: "destructive" },
  ],
  ODENDI: [],
  IPTAL: [
    { status: "TASLAK", label: "Taslağa Geri Al", variant: "outline" },
  ],
};

export function InvoiceStatusActions({ invoiceId, currentStatus }: { invoiceId: string; currentStatus: InvoiceStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const actions = transitions[currentStatus] ?? [];

  if (actions.length === 0) {
    return <p className="text-sm text-slate-500">Bu durumdaki fatura için yapılacak işlem bulunmuyor.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await updateInvoiceStatus(invoiceId, action.status);
              toast.success("Fatura durumu güncellendi");
              router.refresh();
            });
          }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
