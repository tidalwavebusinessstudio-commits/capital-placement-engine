import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getOrganization, getContactsForOrg } from "@/lib/supabase/db";
import { getSectorConfig } from "@/lib/config/sectors";
import { getStageConfig, PIPELINE_STAGES } from "@/lib/config/stages";
import { formatCurrency, formatCurrencyFull, formatDate, formatPercent } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import ScoreGauge from "@/components/ui/ScoreGauge";
import CapitalGapBar from "@/components/ui/CapitalGapBar";
import type { Sector, ProjectStage } from "@/lib/types";
import ExportPdfButton from "@/components/ui/ExportPdfButton";

const REL_COLORS: Record<string, string> = {
  cold: "slate", warm: "amber", hot: "red", active: "green", inactive: "slate",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const org = project.organization_id ? await getOrganization(project.organization_id) : null;
  const contacts = org ? await getContactsForOrg(org.id) : [];
  const sectorCfg = getSectorConfig(project.sector as Sector);
  const stageCfg = getStageConfig(project.stage as ProjectStage);
  const sb = project.score_breakdown;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link href="/projects" className="text-sm text-text-muted hover:text-brand-600 transition-colors">
          &larr; Projects
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
          <Badge label={stageCfg.label} color={stageCfg.color} size="md" />
          <ScoreGauge score={project.priority_score} />
          <ExportPdfButton projectId={id} />
        </div>
        {project.description && (
          <p className="text-sm text-text-secondary mt-2 max-w-3xl">{project.description}</p>
        )}
      </div>

      {/* Pipeline Progress */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Pipeline Stage</h2>
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stageId) => {
            const cfg = getStageConfig(stageId);
            const isCurrent = project.stage === stageId;
            const isPast = cfg.order < stageCfg.order;
            return (
              <div
                key={stageId}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  isCurrent
                    ? "bg-brand-600"
                    : isPast
                      ? "bg-brand-300"
                      : "bg-surface-tertiary"
                }`}
                title={cfg.label}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-text-muted">Discovered</span>
          <span className="text-xs font-medium text-brand-600">{stageCfg.label}</span>
          <span className="text-xs text-text-muted">Closed</span>
        </div>
      </div>

      {/* Main Grid: Financials + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital Structure */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Capital Structure</h2>

          <CapitalGapBar
            totalCost={project.total_project_cost}
            debtSecured={project.debt_secured}
            equitySecured={project.equity_secured}
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <FinancialItem label="Total Project Cost" value={formatCurrencyFull(project.total_project_cost)} />
            <FinancialItem label="Debt Sought" value={formatCurrencyFull(project.debt_sought)} />
            <FinancialItem label="Equity Sought" value={formatCurrencyFull(project.equity_sought)} />
            <FinancialItem label="Debt Secured" value={formatCurrencyFull(project.debt_secured)} highlight="green" />
            <FinancialItem label="Equity Secured" value={formatCurrencyFull(project.equity_secured)} highlight="blue" />
            <FinancialItem label="Funding Gap" value={formatCurrencyFull(project.funding_gap)} highlight="amber" />
            <FinancialItem label="Capital Type" value={project.capital_type ?? "—"} />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Score Breakdown</h2>
            <ScoreGauge score={project.priority_score} />
          </div>

          <div className="space-y-3">
            <ScoreBar label="Sector Fit" value={sb.sector_fit} max={25} />
            <ScoreBar label="Deal Size Fit" value={sb.deal_size_fit} max={20} />
            <ScoreBar label="Capital Gap Clarity" value={sb.capital_gap_clarity} max={15} />
            <ScoreBar label="Geographic Desirability" value={sb.geographic_desirability} max={15} />
            <ScoreBar label="Contact Quality" value={sb.contact_quality} max={15} />
            <ScoreBar label="Timing Urgency" value={sb.timing_urgency} max={10} />
          </div>
        </div>
      </div>

      {/* Fee Estimate */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Fee Estimate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FinancialItem label="Fee %" value={project.estimated_fee_pct ? formatPercent(project.estimated_fee_pct) : "—"} />
          <FinancialItem label="Total Fee" value={formatCurrencyFull(project.estimated_fee_amount)} />
          <FinancialItem label="Your Share %" value={formatPercent(project.kevin_share_pct)} />
          <FinancialItem label="Your Commission" value={formatCurrencyFull(project.kevin_estimated_fee)} highlight="green" />
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailCard label="Sector" value={`${sectorCfg.icon} ${sectorCfg.label}`} />
        <DetailCard label="Project Type" value={project.project_type ?? "—"} />
        <DetailCard label="Location" value={
          [project.location_city, project.location_state].filter(Boolean).join(", ") || "—"
        } />
        <DetailCard label="Target Close" value={formatDate(project.target_close_date)} />
        <DetailCard label="Construction Start" value={formatDate(project.construction_start)} />
        <DetailCard label="Source" value={project.source_type ?? "—"} />
        <DetailCard label="Added" value={formatDate(project.created_at)} />
        <DetailCard label="Updated" value={formatDate(project.updated_at)} />
      </div>

      {/* Sponsor / Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {org && (
          <div className="bg-surface rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Sponsor</h2>
            <Link href={`/organizations/${org.id}`} className="text-sm font-medium text-brand-600 hover:underline">
              {org.name}
            </Link>
            <p className="text-xs text-text-muted mt-1">{org.type} &middot; {org.hq_city}, {org.hq_state}</p>
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Contacts ({contacts.length})
          </h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-text-muted">No contacts linked.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-text-primary hover:text-brand-600 transition-colors">
                      {c.first_name} {c.last_name}
                    </Link>
                    <p className="text-xs text-text-muted">{c.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.is_decision_maker && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">DM</span>
                    )}
                    <Badge label={c.relationship_status} color={REL_COLORS[c.relationship_status] ?? "slate"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Notes</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted">Tags:</span>
          {project.tags.map((tag) => (
            <span key={tag} className="text-xs bg-surface-tertiary text-text-secondary px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FinancialItem({ label, value, highlight }: { label: string; value: string; highlight?: "green" | "blue" | "amber" }) {
  const colorClass = highlight === "green"
    ? "text-green-600"
    : highlight === "blue"
      ? "text-blue-600"
      : highlight === "amber"
        ? "text-amber-600"
        : "text-text-primary";
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-sm font-semibold ${colorClass} tabular-nums`}>{value}</p>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary capitalize">{value}</p>
    </div>
  );
}
