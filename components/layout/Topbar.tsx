"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabaseConfigured =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setEmail("dev@meridian-cap.local");
      return;
    }
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
      });
    });
  }, []);

  async function handleSignOut() {
    if (!supabaseConfigured) {
      router.push("/login");
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 -ml-1 rounded-lg text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-4">
        {email && (
          <span className="text-sm text-text-secondary">{email}</span>
        )}
        <button
          onClick={handleSignOut}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
