import Link from "next/link";
import { MOCK_OPPORTUNITIES } from "@/lib/mock-data-extended";
import { getMockProject } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import { SECTORS } from "@/lib/config/sectors";

const STATUS_COLORS: Record<string, string> = {
  identified: "slate",
  approached: "blue",
  in_discussion: "violet",
  term_sheet: "amber",
  committed: "green",
  closed: "green",
  lost: "red",
};

const STATUS_LABELS: Record<string, string> = {
  identified: "Identified",
  approached: "Approached",
  in_discussion: "In Discussion",
  term_sheet: "Term Sheet",
  committed: "Committed",
  closed: "Closed",
  lost: "Lost",
};

const TYPE_LABELS: Record<string, string> = {
  debt_placement: "Debt",
  equity_placement: "Equity",
  co_invest: "Co-Invest",
};

export default function OpportunitiesPage() {
  const opps = [...MOCK_OPPORTUNITIES].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const active = opps.filter((o) => !["closed", "lost"].includes(o.status));
  const totalActive = active.reduce((s, o) => s + (o.amount ?? 0), 0);
  const totalFees = active.reduce((s, o) => s + (o.fee_amount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Opportunities</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {active.length} active &middot; {formatCurrency(totalActive)} in play &middot;{" "}
            <span className="text-green-600">{formatCurrency(totalFees)} potential fees</span>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {(["identified", "approached", "in_discussion", "term_sheet", "committed"] as const).map((status) => {
          const count = opps.filter((o) => o.status === status).length;
          const value = opps.filter((o) => o.status === status).reduce((s, o) => s + (o.amount ?? 0), 0);
          if (count === 0) return null;
          return (
            <div key={status} className="bg-surface rounded-lg border border-border p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider">{STATUS_LABELS[status]}</p>
              <p className="text-lg font-bold text-text-primary">{count}</p>
              <p className="text-xs text-text-secondary">{formatCurrency(value)}</p>
            </div>
          );
        })}
      </div>

      {/* Opportunity list */}
      <div className="space-y-2">
        {opps.map((opp) => {
          const project = opp.project_id ? getMockProject(opp.project_id) : null;
          const sectorConfig = project?.sector ? SECTORS[project.sector] : null;

          return (
            <div
              key={opp.id}
              className="bg-surface rounded-xl border border-border p-4 hover:border-brand/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge label={STATUS_LABELS[opp.status] ?? opp.status} color={STATUS_COLORS[opp.status] ?? "slate"} size="sm" />
                    <Badge label={TYPE_LABELS[opp.opportunity_type] ?? opp.opportunity_type} color={opp.opportunity_type === "debt_placement" ? "blue" : "violet"} size="sm" />
                    {sectorConfig && (
                      <span className="text-xs text-text-secondary">{sectorConfig.icon} {sectorConfig.label}</span>
                    )}
                  </div>

                  {project && (
                    <Link href={`/projects/${project.id}`} className="text-sm font-semibold text-text-primary hover:text-brand transition-colors">
                      {project.name}
                    </Link>
                  )}

                  <div className="flex items-center gap-4 mt-1.5 text-xs text-text-muted">
                    {opp.amount && (
                      <span className="font-medium text-text-primary">{formatCurrency(opp.amount)}</span>
                    )}
                    {opp.fee_pct && (
                      <span>{opp.fee_pct}% fee</span>
                    )}
                    {opp.fee_amount && (
                      <span className="text-green-600 font-medium">{formatCurrency(opp.fee_amount)} est. fee</span>
                    )}
                    <span>
                      Updated {new Date(opp.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {opp.notes && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-1">{opp.notes}</p>
                  )}
                  {opp.lost_reason && (
                    <p className="text-xs text-red-500 mt-1">Lost: {opp.lost_reason}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
