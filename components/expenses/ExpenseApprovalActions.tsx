"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { approveExpense, rejectExpense } from "@/lib/actions/expense-actions";
import { Button } from "@/components/ui/button";

export function ExpenseApprovalActions({ expenseId }: { expenseId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-3">
      <Button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await approveExpense(expenseId);
            toast.success("Masraf onaylandı");
            router.refresh();
          });
        }}
      >
        Onayla
      </Button>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await rejectExpense(expenseId);
            toast.success("Masraf reddedildi");
            router.refresh();
          });
        }}
      >
        Reddet
      </Button>
    </div>
  );
}
