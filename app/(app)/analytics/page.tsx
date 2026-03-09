"use client";

import { useMemo } from "react";
import { useData } from "@/lib/store/DataContext";
import { SECTOR_LIST } from "@/lib/config/sectors";
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
  const { projects, outreach, sourceRecords, opportunities } = useData();

  const data = useMemo(() => {
    const active = projects.filter((p) => p.stage !== "dead" && !p.archived_at);

    const totalPipeline = active.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
    const totalGap = active.reduce((s, p) => s + (p.funding_gap ?? 0), 0);
    const totalEstFees = active.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
    const totalKevinShare = active.reduce((s, p) => s + (p.kevin_estimated_fee ?? 0), 0);

    const weightedFees = active.reduce((s, p) => {
      const prob = (STAGES[p.stage]?.closeProbability ?? 0) / 100;
      return s + (p.estimated_fee_amount ?? 0) * prob;
    }, 0);

    const bySector = SECTOR_LIST.map((sec) => {
      const secProjects = active.filter((p) => p.sector === sec.id);
      const value = secProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
      const fees = secProjects.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
      const gap = secProjects.reduce((s, p) => s + (p.funding_gap ?? 0), 0);
      const avgScore = secProjects.length > 0
        ? Math.round(secProjects.reduce((s, p) => s + p.priority_score, 0) / secProjects.length)
        : 0;
      return { ...sec, count: secProjects.length, value, fees, gap, avgScore };
    }).filter((s) => s.count > 0);

    const byStage = PIPELINE_STAGES.map((stageId) => {
      const config = STAGES[stageId];
      const stageProjects = active.filter((p) => p.stage === stageId);
      const value = stageProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
      return { ...config, id: stageId, count: stageProjects.length, value };
    }).filter((s) => s.count > 0);

    const outbound = outreach.filter((o) => o.direction === "outbound");
    const replied = outreach.filter((o) => o.status === "replied");
    const opened = outreach.filter((o) => o.status === "opened");
    const replyRate = outbound.length > 0 ? Math.round((replied.length / outbound.length) * 100) : 0;

    const channels: Record<string, number> = {};
    outreach.forEach((o) => (channels[o.channel] = (channels[o.channel] ?? 0) + 1));

    const converted = sourceRecords.filter((s) => s.status === "converted").length;
    const avgRelevance = sourceRecords.length > 0
      ? Math.round(sourceRecords.reduce((s, r) => s + r.relevance_score, 0) / sourceRecords.length)
      : 0;

    const oppTotal = opportunities.reduce((s, o) => s + (o.amount ?? 0), 0);
    const oppFees = opportunities.reduce((s, o) => s + (o.fee_amount ?? 0), 0);
    const oppCommitted = opportunities.filter((o) => o.status === "committed" || o.status === "closed").length;

    return {
      totalPipeline, totalGap, totalEstFees, totalKevinShare, weightedFees,
      activeCount: active.length, bySector, byStage,
      outreach: { total: outreach.length, outbound: outbound.length, replied: replied.length, opened: opened.length, replyRate, channels },
      sources: { total: sourceRecords.length, new: sourceRecords.filter((s) => s.status === "new").length, converted, avgRelevance, conversionRate: sourceRecords.length > 0 ? Math.round((converted / sourceRecords.length) * 100) : 0 },
      opportunities: { total: opportunities.length, value: oppTotal, fees: oppFees, committed: oppCommitted },
    };
  }, [projects, outreach, sourceRecords, opportunities]);

  const maxSectorValue = Math.max(...data.bySector.map((s) => s.value), 1);
  const maxSectorFee = Math.max(...data.bySector.map((s) => s.fees), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Analytics</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <KPI label="Pipeline Value" value={formatCurrency(data.totalPipeline)} sub={`${data.activeCount} projects`} />
        <KPI label="Funding Gap" value={formatCurrency(data.totalGap)} sub={data.totalPipeline > 0 ? `${Math.round((data.totalGap / data.totalPipeline) * 100)}% of pipeline` : "—"} color="text-red-500" />
        <KPI label="Estimated Fees" value={formatCurrency(data.totalEstFees)} />
        <KPI label="Weighted Fees" value={formatCurrency(data.weightedFees)} sub="Probability-adjusted" />
        <KPI label="Your Share" value={formatCurrency(data.weightedFees * (KEVIN_SHARE_PCT / 100))} sub={`${KEVIN_SHARE_PCT}% weighted`} color="text-brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline by Sector</h2>
          <div className="space-y-3">
            {data.bySector.map((sec) => (
              <BarChart key={sec.id} label={`${sec.icon} ${sec.label} (${sec.count})`} value={sec.value} max={maxSectorValue} color="bg-brand" />
            ))}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Fee Forecast by Sector</h2>
          <div className="space-y-3">
            {data.bySector.map((sec) => (
              <BarChart key={sec.id} label={`${sec.icon} ${sec.label}`} value={sec.fees} max={maxSectorFee} color="bg-green-500" />
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
            <span className="text-text-secondary">Total</span>
            <span className="font-bold text-text-primary">{formatCurrency(data.totalEstFees)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-text-secondary">Your Share ({KEVIN_SHARE_PCT}%)</span>
            <span className="font-bold text-brand">{formatCurrency(data.totalKevinShare)}</span>
          </div>
        </div>
      </div>

      {/* Sector Table */}
      <div className="bg-surface rounded-xl border border-border p-5 mb-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Sector Deep Dive</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 text-text-muted font-medium">Sector</th>
              <th className="pb-2 text-text-muted font-medium text-right">Deals</th>
              <th className="pb-2 text-text-muted font-medium text-right">Pipeline</th>
              <th className="pb-2 text-text-muted font-medium text-right">Gap</th>
              <th className="pb-2 text-text-muted font-medium text-right">Est. Fees</th>
              <th className="pb-2 text-text-muted font-medium text-right">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {data.bySector.map((sec) => (
              <tr key={sec.id} className="border-b border-border/50">
                <td className="py-2 text-text-primary">{sec.icon} {sec.label}</td>
                <td className="py-2 text-text-primary text-right">{sec.count}</td>
                <td className="py-2 text-text-primary text-right">{formatCurrency(sec.value)}</td>
                <td className="py-2 text-red-500 text-right">{formatCurrency(sec.gap)}</td>
                <td className="py-2 text-green-600 text-right">{formatCurrency(sec.fees)}</td>
                <td className="py-2 text-text-primary text-right">{sec.avgScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline by Stage</h2>
          <div className="space-y-2">
            {data.byStage.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary">{stage.label}</span>
                  <span className="text-xs text-text-muted">({stage.closeProbability}%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted">{stage.count}</span>
                  <span className="font-medium text-text-primary w-16 text-right">{formatCurrency(stage.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Outreach Performance</h2>
          <div className="space-y-2">
            <Row label="Total" val={String(data.outreach.total)} />
            <Row label="Outbound" val={String(data.outreach.outbound)} />
            <Row label="Opened" val={String(data.outreach.opened)} color="text-violet-600" />
            <Row label="Replied" val={String(data.outreach.replied)} color="text-green-600" />
            <Row label="Reply Rate" val={`${data.outreach.replyRate}%`} color="text-brand" bold />
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-text-muted">
              Channels: {Object.entries(data.outreach.channels).map(([ch, n]) => `${ch} (${n})`).join(", ") || "none"}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Source Pipeline</h2>
          <div className="space-y-2">
            <Row label="Total Sources" val={String(data.sources.total)} />
            <Row label="New" val={String(data.sources.new)} color="text-blue-600" />
            <Row label="Converted" val={String(data.sources.converted)} color="text-green-600" />
            <Row label="Avg Relevance" val={`${data.sources.avgRelevance}/100`} />
            <Row label="Conversion Rate" val={`${data.sources.conversionRate}%`} bold />
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Opportunity Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase">Total</p>
            <p className="text-xl font-bold text-text-primary">{data.opportunities.total}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Value</p>
            <p className="text-xl font-bold text-text-primary">{formatCurrency(data.opportunities.value)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Potential Fees</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(data.opportunities.fees)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase">Committed</p>
            <p className="text-xl font-bold text-brand">{data.opportunities.committed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color ?? "text-text-primary"}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}

function Row({ label, val, color, bold }: { label: string; val: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${color ?? "text-text-primary"}`}>{val}</span>
    </div>
  );
}
