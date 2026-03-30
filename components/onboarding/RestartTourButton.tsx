"use client";

import { useRouter } from "next/navigation";

export default function RestartTourButton() {
  const router = useRouter();

  function handleRestart() {
    localStorage.removeItem("meridian-tour-completed");
    router.push("/dashboard");
  }

  return (
    <button
      onClick={handleRestart}
      className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-hover bg-brand/10 hover:bg-brand/15 px-4 py-2 rounded-lg transition-colors"
    >
      <span>🔄</span> Restart Interactive Tour
    </button>
  );
}
