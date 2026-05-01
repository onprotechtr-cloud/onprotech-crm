"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { convertQuoteToInvoice } from "@/lib/actions/invoice-actions";
import { Button } from "@/components/ui/button";

export function ConvertToInvoiceButton({ quoteId }: { quoteId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      disabled={pending}
      className="border-orange-300 text-orange-700 hover:bg-orange-50"
      onClick={() => {
        startTransition(async () => {
          const result = await convertQuoteToInvoice(quoteId);
          if ("error" in result && result.error) {
            toast.error(String(result.error));
            return;
          }
          toast.success("Fatura oluşturuldu, Faturalar sayfasına yönlendiriliyorsunuz.");
          router.push(`/dashboard/faturalar/${result.data?.id}`);
          router.refresh();
        });
      }}
    >
      <FileText className="h-4 w-4" />
      {pending ? "Dönüştürülüyor..." : "Faturaya Dönüştür"}
    </Button>
  );
}
