"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteQuote } from "@/lib/actions/quote-actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function QuoteDeleteButton({
  id,
  quoteNumber,
}: {
  id: string;
  quoteNumber: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteQuote(id);
    toast.success(`${quoteNumber} silindi`);
    router.push("/teklifler");
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Emin misiniz?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Siliniyor..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
    >
      <Trash2 size={15} />
      Sil
    </button>
  );
}
