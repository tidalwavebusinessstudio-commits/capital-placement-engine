import Link from "next/link";
import { notFound } from "next/navigation";
import { getSourceRecord } from "@/lib/supabase/db";
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

export default async function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await getSourceRecord(id);
  if (!source) return notFound();

  const sectorConfig = source.sector_guess ? SECTORS[source.sector_guess] : null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/sources" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Sources
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge label={source.status} color={STATUS_COLORS[source.status] ?? "slate"} />
            <ScoreGauge score={source.relevance_score} />
          </div>
          <h1 className="text-xl font-bold text-text-primary">{source.title}</h1>
        </div>
        {source.status === "new" && (
          <Link
            href={`/projects/new?source=${source.id}`}
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors whitespace-nowrap"
          >
            Convert to Project
          </Link>
        )}
      </div>

      {/* Details */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Source Type</span>
            <p className="font-medium text-text-primary capitalize">{source.source_type.replace("_", " ")}</p>
          </div>
          <div>
            <span className="text-text-muted">Sector</span>
            <p className="font-medium text-text-primary">
              {sectorConfig ? `${sectorConfig.icon} ${sectorConfig.label}` : "Unknown"}
            </p>
          </div>
          <div>
            <span className="text-text-muted">Location</span>
            <p className="font-medium text-text-primary">{source.location_guess ?? "Unknown"}</p>
          </div>
          <div>
            <span className="text-text-muted">Estimated Amount</span>
            <p className="font-medium text-text-primary">
              {source.amount_guess ? formatCurrency(source.amount_guess) : "Unknown"}
            </p>
          </div>
          <div>
            <span className="text-text-muted">Relevance Score</span>
            <p className="font-medium text-text-primary">{source.relevance_score}/100</p>
          </div>
          <div>
            <span className="text-text-muted">Discovered</span>
            <p className="font-medium text-text-primary">
              {new Date(source.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
          {source.url && (
            <div className="col-span-2">
              <span className="text-text-muted">URL</span>
              <p className="font-medium text-brand truncate">{source.url}</p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Content */}
      {source.raw_content && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Raw Content
          </h2>
          <p className="text-sm text-text-primary leading-relaxed">{source.raw_content}</p>
        </div>
      )}

      {/* Extracted Data */}
      {Object.keys(source.extracted_data).length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Extracted Data
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(source.extracted_data).map(([key, value]) => (
              <div key={key}>
                <span className="text-text-muted capitalize">{key.replace(/_/g, " ")}</span>
                <p className="font-medium text-text-primary">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dismissed reason */}
      {source.dismissed_reason && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Dismissed:</span> {source.dismissed_reason}
          </p>
        </div>
      )}
    </div>
  );
}
