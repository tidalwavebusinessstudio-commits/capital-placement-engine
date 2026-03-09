import { MOCK_PROJECTS } from "@/lib/mock-data";
import { MOCK_OUTREACH, MOCK_SOURCE_RECORDS } from "@/lib/mock-data-extended";
import { SECTORS, SECTOR_LIST } from "@/lib/config/sectors";
import { STAGES, PIPELINE_STAGES } from "@/lib/config/stages";
import { formatCurrency } from "@/lib/utils/format";
import { KEVIN_SHARE_PCT } from "@/lib/config/constants";

function BarChart({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-32 truncate">{label}</span>
      <div className="flex-1 h-5 bg-surface-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-text-primary w-16 text-right">{formatCurrency(value)}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const projects = MOCK_PROJECTS.filter((p) => p.stage !== "dead");

  // Fee forecasting
  const totalPipeline = projects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
  const totalGap = projects.reduce((s, p) => s + (p.funding_gap ?? 0), 0);
  const totalEstFees = projects.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
  const totalKevinShare = projects.reduce((s, p) => s + (p.kevin_estimated_fee ?? 0), 0);

  // Weighted pipeline (by close probability)
  const weightedFees = projects.reduce((s, p) => {
    const stageConfig = STAGES[p.stage];
    const prob = stageConfig?.closeProbability ?? 0;
    return s + (p.estimated_fee_amount ?? 0) * prob;
  }, 0);

  // By sector
  const bySector = SECTOR_LIST.map((sec) => {
    const secProjects = projects.filter((p) => p.sector === sec.id);
    const value = secProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
    const fees = secProjects.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
    return { ...sec, count: secProjects.length, value, fees };
  }).filter((s) => s.count > 0);

  // By stage
  const byStage = PIPELINE_STAGES.map((stageId) => {
    const config = STAGES[stageId];
    const stageProjects = projects.filter((p) => p.stage === stageId);
    const value = stageProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
    return { ...config, id: stageId, count: stageProjects.length, value };
  }).filter((s) => s.count > 0);

  // Outreach stats
  const outbound = MOCK_OUTREACH.filter((o) => o.direction === "outbound");
  const replied = MOCK_OUTREACH.filter((o) => o.status === "replied");
  const replyRate = outbound.length > 0 ? Math.round((replied.length / outbound.length) * 100) : 0;

  // Source stats
  const newSources = MOCK_SOURCE_RECORDS.filter((s) => s.status === "new");
  const avgRelevance = MOCK_SOURCE_RECORDS.length > 0
    ? Math.round(MOCK_SOURCE_RECORDS.reduce((s, r) => s + r.relevance_score, 0) / MOCK_SOURCE_RECORDS.length)
    : 0;

  const maxSectorValue = Math.max(...bySector.map((s) => s.value), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Analytics</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Pipeline Value</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totalPipeline)}</p>
          <p className="text-xs text-text-secondary mt-0.5">{projects.length} active projects</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Total Funding Gap</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalGap)}</p>
          <p className="text-xs text-text-secondary mt-0.5">{Math.round((totalGap / totalPipeline) * 100)}% of pipeline</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Weighted Fees</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(weightedFees)}</p>
          <p className="text-xs text-text-secondary mt-0.5">Probability-adjusted</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Your Share (Weighted)</p>
          <p className="text-2xl font-bold text-brand mt-1">{formatCurrency(weightedFees * (KEVIN_SHARE_PCT / 100))}</p>
          <p className="text-xs text-text-secondary mt-0.5">{KEVIN_SHARE_PCT}% of weighted fees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pipeline by Sector */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline by Sector</h2>
          <div className="space-y-3">
            {bySector.map((sec) => (
              <BarChart
                key={sec.id}
                label={`${sec.icon} ${sec.label} (${sec.count})`}
                value={sec.value}
                max={maxSectorValue}
                color="bg-brand"
              />
            ))}
          </div>
        </div>

        {/* Fee Breakdown by Sector */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Fee Forecast by Sector</h2>
          <div className="space-y-3">
            {bySector.map((sec) => (
              <BarChart
                key={sec.id}
                label={`${sec.icon} ${sec.label}`}
                value={sec.fees}
                max={Math.max(...bySector.map((s) => s.fees), 1)}
                color="bg-green-500"
              />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
            <span className="text-text-secondary">Total Estimated Fees</span>
            <span className="font-bold text-text-primary">{formatCurrency(totalEstFees)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-text-secondary">Your Share ({KEVIN_SHARE_PCT}%)</span>
            <span className="font-bold text-brand">{formatCurrency(totalKevinShare)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by Stage */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline by Stage</h2>
          <div className="space-y-2">
            {byStage.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-text-primary">{stage.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{stage.count}</span>
                  <span className="font-medium text-text-primary w-16 text-right">{formatCurrency(stage.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outreach Performance */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Outreach Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Outreach</span>
              <span className="font-medium text-text-primary">{MOCK_OUTREACH.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Outbound</span>
              <span className="font-medium text-text-primary">{outbound.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Replies</span>
              <span className="font-medium text-green-600">{replied.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Reply Rate</span>
              <span className="font-bold text-brand">{replyRate}%</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-text-muted">Channels used: Email, Phone, LinkedIn</p>
            </div>
          </div>
        </div>

        {/* Source Pipeline */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Source Pipeline</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Sources</span>
              <span className="font-medium text-text-primary">{MOCK_SOURCE_RECORDS.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">New (Unreviewed)</span>
              <span className="font-medium text-blue-600">{newSources.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Avg Relevance</span>
              <span className="font-medium text-text-primary">{avgRelevance}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Conversion Rate</span>
              <span className="font-medium text-text-primary">0%</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-text-muted">Top sources: News, LinkedIn, Referral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
