"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/store/ToastContext";

interface InlineDeepExtractProps {
  sourceId: string;
  url: string;
}

export default function InlineDeepExtract({ sourceId, url }: InlineDeepExtractProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-brand hover:bg-brand/10 px-2 py-1 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
      title="Scrape article and extract project data"
    >
      {loading ? "..." : "\uD83D\uDD0D"}
    </button>
  );
}
