"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/format";
import type { ExtractedProject } from "@/lib/ai/extract";

const SECTOR_LABELS: Record<string, string> = {
  data_center: "Data Centers",
  cre: "Commercial Real Estate",
  hospitality: "Hospitality",
  energy: "Energy",
  infrastructure: "Infrastructure",
  manufacturing: "Manufacturing",
  tech: "Technology",
};

export default function AIExtractPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Extraction failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Network error — please try again");
    }
    setLoading(false);
  }

  function relevanceColor(score: number): string {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "amber";
    return "red";
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/sources" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Sources
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">AI Source Extraction</h1>
        <p className="text-sm text-text-secondary mt-1">
          Paste a news article, filing, or LinkedIn post — AI will extract project details
        </p>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <label htmlFor="source-text" className="block text-sm font-medium text-text-primary mb-2">
          Source Content
        </label>
        <textarea
          id="source-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none font-mono"
          placeholder="Paste article text, press release, LinkedIn post, FERC filing, etc..."
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-text-muted">{text.length} characters</span>
          <button
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙</span> Analyzing...
              </>
            ) : (
              <>
                <span>🤖</span> Extract with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
          {error.includes("not configured") && (
            <p className="text-xs text-red-600 mt-1">
              Add <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY</code> to your .env.local file
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-text-primary">
                {result.project_name || "Unnamed Project"}
              </h2>
              <Badge
                label={`Relevance: ${result.relevance_score}`}
                color={relevanceColor(result.relevance_score)}
                size="md"
              />
            </div>
            {result.relevance_reasoning && (
              <p className="text-sm text-text-secondary">{result.relevance_reasoning}</p>
            )}
          </div>

          {/* Data grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Organization</p>
                <p className="text-sm text-text-primary">{result.organization_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Sector</p>
                <p className="text-sm text-text-primary">
                  {result.sector ? SECTOR_LABELS[result.sector] || result.sector : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-text-primary">
                  {[result.location_city, result.location_state].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Project Type</p>
                <p className="text-sm text-text-primary capitalize">
                  {result.project_type?.replace(/_/g, " ") || "—"}
                </p>
              </div>
            </div>

            {/* Financial */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Capital Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Total Cost</p>
                  <p className="text-lg font-bold text-text-primary">
                    {result.total_project_cost ? formatCurrency(result.total_project_cost) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Debt Sought</p>
                  <p className="text-lg font-bold text-text-primary">
                    {result.debt_sought ? formatCurrency(result.debt_sought) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Equity Sought</p>
                  <p className="text-lg font-bold text-text-primary">
                    {result.equity_sought ? formatCurrency(result.equity_sought) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-text-primary">{result.description}</p>
              </div>
            )}

            {/* Contacts */}
            {result.key_contacts && result.key_contacts.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Mentioned Contacts</p>
                <div className="flex flex-wrap gap-2">
                  {result.key_contacts.map((name, i) => (
                    <Badge key={i} label={name} color="blue" />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-border pt-4 flex items-center gap-3">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
              >
                → Create Project
              </Link>
              <button
                onClick={() => { setResult(null); setText(""); }}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Extract Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
