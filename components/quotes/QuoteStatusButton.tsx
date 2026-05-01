"use client";

import { useState } from "react";
import { updateQuoteStatus } from "@/lib/actions/quote-actions";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const statusOptions = [
  { value: "DRAFT", label: "Taslak" },
  { value: "SENT", label: "Gönderildi" },
  { value: "ACCEPTED", label: "Kabul Edildi" },
  { value: "REJECTED", label: "Reddedildi" },
] as const;

export default function QuoteStatusButton({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleChange(status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED") {
    setLoading(true);
    setOpen(false);
    await updateQuoteStatus(id, status);
    toast.success("Durum güncellendi");
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ChevronDown size={15} />
        Durum Değiştir
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {statusOptions
            .filter((s) => s.value !== currentStatus)
            .map((s) => (
              <button
                key={s.value}
                onClick={() => handleChange(s.value)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {s.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
