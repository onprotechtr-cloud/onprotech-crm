"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeServicePart } from "@/lib/actions/service-actions";
import { Trash2 } from "lucide-react";

export function RemoveServicePartButton({
  partId,
  serviceOrderId,
}: {
  partId: string;
  serviceOrderId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          const result = await removeServicePart(partId, serviceOrderId);
          if ("error" in result && result.error) {
            toast.error(result.error as string);
          } else {
            toast.success("Parça kaldırıldı, stoka iade edildi.");
            router.refresh();
          }
        });
      }}
      disabled={isPending}
      className="text-rose-400 hover:text-rose-600 disabled:opacity-50 transition-colors"
      title="Parçayı kaldır"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
