"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { formatCurrency, formatRelativeDate } from "@/lib/utils/format";
import { SECTOR_LIST, SECTORS } from "@/lib/config/sectors";
import { STAGE_LIST, STAGES, ACTIVE_STAGES } from "@/lib/config/stages";
import { KEVIN_SHARE_PCT, SCORE_HIGH_THRESHOLD } from "@/lib/config/constants";
import { generateAllAlerts } from "@/lib/workflow/rules";

export default function DashboardPage() {
  const {
    projects, organizations, contacts, sourceRecords,
    outreach, opportunities, activity, complianceLog, newsletters,
  } = useData();

  const stats = useMemo(() => {
    const active = projects.filter(
      (p) => ACTIVE_STAGES.includes(p.stage) && !p.archived_at
    );
    const totalPipeline = active.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
    const totalGap = active.reduce((s, p) => s + (p.funding_gap ?? 0), 0);
    const estFees = active.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
    const kevinShare = active.reduce((s, p) => s + (p.kevin_estimated_fee ?? 0), 0);

    const weightedFees = active.reduce((s, p) => {
      const prob = (STAGES[p.stage]?.closeProbability ?? 0) / 100;
      return s + (p.estimated_fee_amount ?? 0) * prob;
    }, 0);

    const byStage: Record<string, number> = {};
    STAGE_LIST.forEach((st) => (byStage[st.id] = 0));
    projects.filter((p) => !p.archived_at).forEach((p) => (byStage[p.stage] = (byStage[p.stage] ?? 0) + 1));

    const bySector: Record<string, number> = {};
    SECTOR_LIST.forEach((sec) => (bySector[sec.id] = 0));
    active.forEach((p) => (bySector[p.sector] = (bySector[p.sector] ?? 0) + 1));

    const newSources = sourceRecords.filter((s) => s.status === "new").length;
    const pendingApproval = complianceLog.filter(
      (c) => c.firm_approval_required && !c.firm_approved
    ).length;

    const highPriority = active
      .filter((p) => p.priority_score >= SCORE_HIGH_THRESHOLD)
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5);

    // Deals needing attention (stale > 5 days)
    const now = Date.now();
    const staleDeals = active.filter((p) => {
      const updated = new Date(p.updated_at).getTime();
      return now - updated > 5 * 24 * 60 * 60 * 1000;
    });

    return {
      totalPipeline, totalGap, estFees, kevinShare, weightedFees,
      activeCount: active.length,
      totalProjects: projects.length,
      byStage, bySector,
      newSources, pendingApproval,
      highPriority, staleDeals,
      orgCount: organizations.length,
      contactCount: contacts.length,
      opportunityCount: opportunities.length,
      outboundCount: outreach.filter((o) => o.direction === "outbound").length,
      newsletterDrafts: newsletters.filter((n) => n.status === "draft" || n.status === "review").length,
      workflowAlerts: generateAllAlerts(projects, outreach, opportunities).filter((a) => a.severity !== "info").length,
    };
  }, [projects, organizations, contacts, sourceRecords, outreach, opportunities, complianceLog, newsletters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {stats.activeCount} active deals &middot; {stats.totalProjects} total
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          + New Project
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <KPICard label="Pipeline Value" value={formatCurrency(stats.totalPipeline)} accent="brand" />
        <KPICard label="Funding Gap" value={formatCurrency(stats.totalGap)} accent="red" />
        <KPICard label="Estimated Fees" value={formatCurrency(stats.estFees)} />
        <KPICard label="Weighted Fees" value={formatCurrency(stats.weightedFees)} sub="Probability-adjusted" />
        <KPICard label="Your Share" value={formatCurrency(stats.kevinShare)} accent="brand" sub={`${KEVIN_SHARE_PCT}% of fees`} />
      </div>

      {/* Alert Badges */}
      {(stats.newSources > 0 || stats.pendingApproval > 0 || stats.staleDeals.length > 0 || stats.newsletterDrafts > 0 || stats.workflowAlerts > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {stats.newSources > 0 && (
            <Link href="/sources" className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              📡 {stats.newSources} new source{stats.newSources > 1 ? "s" : ""} to review
            </Link>
          )}
          {stats.pendingApproval > 0 && (
            <Link href="/compliance" className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
              🛡️ {stats.pendingApproval} pending approval{stats.pendingApproval > 1 ? "s" : ""}
            </Link>
          )}
          {stats.staleDeals.length > 0 && (
            <Link href="/projects" className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              ⚠️ {stats.staleDeals.length} stale deal{stats.staleDeals.length > 1 ? "s" : ""} need attention
            </Link>
          )}
          {stats.newsletterDrafts > 0 && (
            <Link href="/newsletter" className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              📰 {stats.newsletterDrafts} newsletter draft{stats.newsletterDrafts > 1 ? "s" : ""}
            </Link>
          )}
          {stats.workflowAlerts > 0 && (
            <Link href="/workflow" className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
              🔔 {stats.workflowAlerts} workflow alert{stats.workflowAlerts > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Pipeline by Stage */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Pipeline by Stage</h2>
          <div className="space-y-1.5">
            {STAGE_LIST.filter((st) => st.id !== "dead").map((stage) => {
              const count = stats.byStage[stage.id] ?? 0;
              return (
                <div key={stage.id} className="flex items-center justify-between text-sm py-0.5">
                  <span className="text-text-secondary">{stage.label}</span>
                  <span className={`font-medium ${count > 0 ? "text-text-primary" : "text-text-muted"}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Active by Sector</h2>
          <div className="space-y-1.5">
            {SECTOR_LIST.map((sec) => {
              const count = stats.bySector[sec.id] ?? 0;
              return (
                <div key={sec.id} className="flex items-center justify-between text-sm py-0.5">
                  <span className="text-text-secondary">{sec.icon} {sec.label}</span>
                  <span className={`font-medium ${count > 0 ? "text-text-primary" : "text-text-muted"}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Priority Deals */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            High Priority <span className="text-text-muted font-normal">({SCORE_HIGH_THRESHOLD}+)</span>
          </h2>
          {stats.highPriority.length === 0 ? (
            <p className="text-sm text-text-muted py-2">No high priority projects</p>
          ) : (
            <div className="space-y-2">
              {stats.highPriority.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between hover:bg-surface-secondary -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-muted">
                      {SECTORS[p.sector]?.icon} {formatCurrency(p.total_project_cost)} &middot; {STAGES[p.stage]?.label}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    {p.priority_score}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Platform Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Organizations" value={stats.orgCount} href="/organizations" />
            <MiniStat label="Contacts" value={stats.contactCount} href="/contacts" />
            <MiniStat label="Opportunities" value={stats.opportunityCount} href="/opportunities" />
            <MiniStat label="Outreach Sent" value={stats.outboundCount} href="/outreach" />
            <MiniStat label="Sources" value={sourceRecords.length} href="/sources" />
            <MiniStat label="Audit Logs" value={complianceLog.length} href="/compliance" />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-text-muted py-2">No activity yet</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {activity.slice(0, 15).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 text-sm py-0.5">
                  <span className="text-text-muted text-xs w-16 flex-shrink-0">
                    {formatRelativeDate(entry.created_at)}
                  </span>
                  <span className="text-text-secondary truncate">
                    <span className="font-medium text-text-primary">{entry.action.replace(/_/g, " ")}</span>
                    {" "}&mdash; {entry.entity_type.replace(/_/g, " ")}
                    {entry.details && typeof entry.details === "object" && "name" in entry.details
                      ? ` "${(entry.details as Record<string, unknown>).name}"`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, accent = "default", sub }: { label: string; value: string; accent?: string; sub?: string }) {
  const colors: Record<string, string> = { brand: "text-brand", red: "text-red-500", green: "text-green-600", default: "text-text-primary" };
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colors[accent] ?? colors.default}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block p-2 rounded-lg hover:bg-surface-secondary transition-colors">
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </Link>
  );
}
