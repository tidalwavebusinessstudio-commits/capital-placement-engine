"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured (public env var available in browser)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setDevMode(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Dev mode — skip Supabase auth entirely
    if (devMode) {
      router.push("/dashboard");
      return;
    }

    // Production mode — real Supabase auth
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleDevLogin() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Meridian Cap</h1>
          <p className="text-brand-300 text-sm mt-1">Capital Placement Engine</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-surface rounded-xl shadow-lg p-6 space-y-4"
        >
          {devMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <p className="text-xs font-medium text-amber-800">Dev Mode</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Supabase not configured. Using mock data.
              </p>
              <button
                type="button"
                onClick={handleDevLogin}
                className="mt-2 w-full py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Enter as Kevin (Dev)
              </button>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!devMode}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="you@firm.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!devMode}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-brand-400 mt-4">
          Internal use only. All activity is logged for compliance.
        </p>
      </div>
    </div>
  );
}
