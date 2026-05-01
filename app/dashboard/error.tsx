"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <h2 className="text-lg font-semibold text-rose-700">Bir hata oluştu</h2>
      <p className="mt-2 text-sm text-rose-600">{error.message || "İşlem sırasında beklenmeyen bir sorun oluştu."}</p>
      <Button className="mt-4" onClick={reset}>
        Tekrar Dene
      </Button>
    </div>
  );
}