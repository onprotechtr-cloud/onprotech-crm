"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { QuoteStatus } from "@prisma/client";
import { toast } from "sonner";
import { updateQuoteStatusAction } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

const statusOptions: Array<{ value: QuoteStatus; label: string }> = [
  { value: "DRAFT", label: "Taslak" },
  { value: "SENT", label: "Gönderildi" },
  { value: "ACCEPTED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
];

export function QuoteStatusActions({ quoteId, currentStatus }: { quoteId: string; currentStatus: QuoteStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((status) => (
        <Button
          key={status.value}
          disabled={pending || currentStatus === status.value}
          type="button"
          variant={currentStatus === status.value ? "default" : "outline"}
          onClick={() =>
            startTransition(async () => {
              try {
                const result = await updateQuoteStatusAction(quoteId, status.value);
                toast.success(result.message);
                router.refresh();
              } catch (error) {
                toast.error(getErrorMessage(error));
              }
            })
          }
        >
          {status.label}
        </Button>
      ))}
    </div>
  );
}