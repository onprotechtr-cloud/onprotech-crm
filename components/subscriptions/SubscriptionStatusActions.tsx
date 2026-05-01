"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSubscriptionStatus } from "@/lib/actions/subscription-actions";
import { Button } from "@/components/ui/button";
import type { SubscriptionStatus } from "@prisma/client";

const transitions: Record<string, Array<{ status: SubscriptionStatus; label: string; variant: "default" | "outline" | "destructive" }>> = {
  AKTIF: [
    { status: "PASIF", label: "Pasife Al", variant: "outline" },
    { status: "IPTAL", label: "İptal Et", variant: "destructive" },
  ],
  PASIF: [
    { status: "AKTIF", label: "Aktifleştir", variant: "default" },
    { status: "IPTAL", label: "İptal Et", variant: "destructive" },
  ],
  IPTAL: [
    { status: "AKTIF", label: "Yeniden Aktifleştir", variant: "default" },
  ],
  SURESI_DOLDU: [
    { status: "AKTIF", label: "Yenile (Aktifleştir)", variant: "default" },
  ],
};

export function SubscriptionStatusActions({ subscriptionId, currentStatus }: { subscriptionId: string; currentStatus: SubscriptionStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const actions = transitions[currentStatus] ?? [];

  if (actions.length === 0) return <p className="text-sm text-slate-500">Bu durum için yapılacak işlem bulunmuyor.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await updateSubscriptionStatus(subscriptionId, action.status);
              toast.success("Abonelik durumu güncellendi");
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
