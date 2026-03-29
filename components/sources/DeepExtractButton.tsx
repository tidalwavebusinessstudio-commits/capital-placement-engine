"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/store/ToastContext";

interface DeepExtractButtonProps {
  sourceId: string;
  url: string;
}

export default function DeepExtractButton({ sourceId, url }: DeepExtractButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleDeepExtract() {
    setLoading(true);
    try {
      const res = await fetch("/api/sources/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, sourceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Deep extract failed", "error");
        setLoading(false);
        return;
      }

      toast("Article analyzed — data extracted");
      router.refresh();
    } catch {
      toast("Network error — please try again", "error");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDeepExtract}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm text-brand font-medium hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "Analyzing..." : "\uD83D\uDD0D Deep Extract"}
    </button>
  );
}
