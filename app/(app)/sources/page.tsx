import Link from "next/link";
import { MOCK_SOURCE_RECORDS } from "@/lib/mock-data-extended";
import { SECTORS } from "@/lib/config/sectors";
import { formatCurrency } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import ScoreGauge from "@/components/ui/ScoreGauge";

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

export default function SourcesPage() {
  const sources = [...MOCK_SOURCE_RECORDS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newCount = sources.filter((s) => s.status === "new").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sources</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {sources.length} records &middot; {newCount} new
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="space-y-3">
        {sources.map((source) => {
          const sectorConfig = source.sector_guess ? SECTORS[source.sector_guess] : null;
          return (
            <Link
              key={source.id}
              href={`/sources/${source.id}`}
              className="block bg-surface rounded-xl border border-border p-4 hover:border-brand/40 hover:shadow-sm transition-all"
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
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {source.title}
                  </h3>
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
                </div>
                <ScoreGauge score={source.relevance_score} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
