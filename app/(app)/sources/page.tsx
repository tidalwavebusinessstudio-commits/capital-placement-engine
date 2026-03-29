"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { SECTORS } from "@/lib/config/sectors";
import { formatCurrency } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import ScoreGauge from "@/components/ui/ScoreGauge";
import InlineDeepExtract from "@/components/sources/InlineDeepExtract";
import type { SourceStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, "blue" | "green" | "amber" | "slate"> = {
  new: "blue",
  reviewed: "amber",
  converted: "green",
  dismissed: "slate",
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  news: "News",
  linkedin: "LinkedIn",
  public_filing: "Filing",
  referral: "Referral",
  rss: "RSS",
  manual: "Manual",
  csv_import: "CSV",
};

const STATUS_OPTIONS: { value: SourceStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "converted", label: "Converted" },
  { value: "dismissed", label: "Dismissed" },
];

export default function SourcesPage() {
  const { sourceRecords, updateSourceStatus } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");

  const filtered = useMemo(() => {
    let list = [...sourceRecords].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.location_guess?.toLowerCase().includes(q) ||
          s.source_type.includes(q)
      );
    }
    return list;
  }, [sourceRecords, search, statusFilter]);

  const newCount = sourceRecords.filter((s) => s.status === "new").length;

  function handleStatusChange(id: string, status: SourceStatus) {
    updateSourceStatus(id, status);
    toast(status === "dismissed" ? "Source dismissed" : `Source marked as ${status}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sources</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {sourceRecords.length} records &middot;{" "}
            <span className="text-blue-600">{newCount} new</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sources/feeds"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            📡 Monitors
          </Link>
          <Link
            href="/sources/extract"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            🤖 AI Extract
          </Link>
          <Link
            href="/sources/import"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sources..."
          className="w-full max-w-xs px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((source) => {
          const sectorConfig = source.sector_guess ? SECTORS[source.sector_guess] : null;
          return (
            <div
              key={source.id}
              className="bg-surface rounded-xl border border-border p-4 hover:border-brand/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={source.status} color={STATUS_COLORS[source.status] ?? "slate"} size="sm" />
                    <Badge label={SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type} color="slate" size="sm" />
                    {sectorConfig && (
                      <span className="text-xs text-text-secondary">
                        {sectorConfig.icon} {sectorConfig.label}
                      </span>
                    )}
                  </div>
                  <Link href={`/sources/${source.id}`}>
                    <h3 className="text-sm font-semibold text-text-primary truncate hover:underline">
                      {source.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    {source.location_guess && <span>{source.location_guess}</span>}
                    {source.amount_guess && (
                      <span className="font-medium text-text-secondary">
                        {formatCurrency(source.amount_guess)}
                      </span>
                    )}
                    <span>
                      {new Date(source.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {source.raw_content && (
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{source.raw_content}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ScoreGauge score={source.relevance_score} />
                  {/* Deep extract for sources with URL but no extracted data */}
                  {source.url &&
                    (!source.extracted_data || Object.keys(source.extracted_data).length === 0) &&
                    (source.status === "new" || source.status === "reviewed") && (
                      <InlineDeepExtract sourceId={source.id} url={source.url} />
                    )}
                  {/* Quick actions */}
                  {source.status === "new" && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleStatusChange(source.id, "reviewed")}
                        className="text-xs text-amber-600 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(source.id, "dismissed")}
                        className="text-xs text-text-muted hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  {source.status === "reviewed" && (
                    <Link
                      href={`/projects/new?source=${source.id}`}
                      className="text-xs text-brand font-medium hover:bg-brand/10 px-2 py-1 rounded transition-colors whitespace-nowrap"
                    >
                      → Convert
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            No sources match your filters
          </div>
        )}
      </div>
    </div>
  );
}
