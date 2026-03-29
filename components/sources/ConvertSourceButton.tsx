"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/store/ToastContext";

interface ConvertSourceButtonProps {
  sourceId: string;
  extractedData: Record<string, unknown>;
}

export default function ConvertSourceButton({ sourceId, extractedData }: ConvertSourceButtonProps) {
  const [converting, setConverting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleConvert() {
    setConverting(true);
    try {
      const res = await fetch("/api/sources/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted: extractedData, sourceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Conversion failed", "error");
        setConverting(false);
        return;
      }

      const data = await res.json();
      toast(`Project created: ${data.project.name}`);
      router.push(`/projects/${data.project.id}`);
    } catch {
      toast("Network error — please try again", "error");
      setConverting(false);
    }
  }

  return (
    <button
      onClick={handleConvert}
      disabled={converting}
      className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
    >
      {converting ? "Converting..." : "Quick Convert to Project"}
    </button>
  );
}
