import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format";
import { SECTOR_LIST } from "@/lib/config/sectors";
import { STAGE_LIST } from "@/lib/config/stages";
import { MOCK_PROJECTS, MOCK_ACTIVITY } from "@/lib/mock-data";

function getMockDashboard() {
  const projects = MOCK_PROJECTS.filter((p) => !p.archived_at);
  const activeProjects = projects.filter((p) => p.stage !== "dead" && p.stage !== "closed");

  const projectsByStage: Record<string, number> = {};
  for (const s of STAGE_LIST) projectsByStage[s.id] = 0;
  for (const p of projects) projectsByStage[p.stage] = (projectsByStage[p.stage] ?? 0) + 1;

  const projectsBySector: Record<string, number> = {};
  for (const s of SECTOR_LIST) projectsBySector[s.id] = 0;
  for (const p of activeProjects) projectsBySector[p.sector] = (projectsBySector[p.sector] ?? 0) + 1;

  return {
    totalPipelineValue: activeProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0),
    activeProjectCount: activeProjects.length,
    estimatedFees: activeProjects.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0),
    kevinShare: activeProjects.reduce((s, p) => s + (p.kevin_estimated_fee ?? 0), 0),
    projectsByStage,
    projectsBySector,
    newSourceRecords: 3,
    outreachSent: 2,
    recentActivity: MOCK_ACTIVITY,
    highPriorityProjects: activeProjects.filter((p) => p.priority_score >= 80).slice(0, 5),
  };
}

async function getDashboardData() {
  // Use mock data if Supabase isn't configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return getMockDashboard();
  }

  const supabase = await createClient();

  const [
    { data: projects },
    { data: recentActivity },
    { data: sourceRecords },
    { data: outreachRecords },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, sector, stage, total_project_cost, priority_score, estimated_fee_amount, kevin_estimated_fee, created_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("source_records")
      .select("id, status")
      .eq("status", "new"),
    supabase
      .from("outreach")
      .select("id, status, sent_at")
      .neq("status", "draft"),
  ]);

  const activeProjects = (projects ?? []).filter(
    (p) => p.stage !== "dead" && p.stage !== "closed"
  );

  const totalPipelineValue = activeProjects.reduce(
    (sum, p) => sum + (p.total_project_cost ?? 0),
    0
  );
  const estimatedFees = activeProjects.reduce(
    (sum, p) => sum + (p.estimated_fee_amount ?? 0),
    0
  );
  const kevinShare = activeProjects.reduce(
    (sum, p) => sum + (p.kevin_estimated_fee ?? 0),
    0
  );

  const projectsByStage: Record<string, number> = {};
  for (const s of STAGE_LIST) projectsByStage[s.id] = 0;
  for (const p of projects ?? []) {
    projectsByStage[p.stage] = (projectsByStage[p.stage] ?? 0) + 1;
  }

  const projectsBySector: Record<string, number> = {};
  for (const s of SECTOR_LIST) projectsBySector[s.id] = 0;
  for (const p of activeProjects) {
    projectsBySector[p.sector] = (projectsBySector[p.sector] ?? 0) + 1;
  }

  return {
    totalPipelineValue,
    activeProjectCount: activeProjects.length,
    estimatedFees,
    kevinShare,
    projectsByStage,
    projectsBySector,
    newSourceRecords: sourceRecords?.length ?? 0,
    outreachSent: outreachRecords?.length ?? 0,
    recentActivity: recentActivity ?? [],
    highPriorityProjects: activeProjects
      .filter((p) => p.priority_score >= 80)
      .slice(0, 5),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Pipeline Value"
          value={formatCurrency(data.totalPipelineValue)}
          sub={`${data.activeProjectCount} active projects`}
        />
        <KPICard
          label="Estimated Fees"
          value={formatCurrency(data.estimatedFees)}
          sub="Total placement fees"
        />
        <KPICard
          label="Your Share"
          value={formatCurrency(data.kevinShare)}
          sub="50% of partner fees"
        />
        <KPICard
          label="New Sources"
          value={String(data.newSourceRecords)}
          sub="Awaiting review"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by Stage */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline by Stage</h2>
          <div className="space-y-2">
            {STAGE_LIST.filter((s) => s.id !== "dead").map((stage) => (
              <div key={stage.id} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{stage.label}</span>
                <span className="font-medium text-text-primary">
                  {data.projectsByStage[stage.id] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Projects by Sector */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Projects by Sector</h2>
          <div className="space-y-2">
            {SECTOR_LIST.map((sector) => (
              <div key={sector.id} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {sector.icon} {sector.label}
                </span>
                <span className="font-medium text-text-primary">
                  {data.projectsBySector[sector.id] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* High Priority Projects */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">High Priority</h2>
          {data.highPriorityProjects.length === 0 ? (
            <p className="text-sm text-text-muted">No high priority projects yet</p>
          ) : (
            <div className="space-y-3">
              {data.highPriorityProjects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between hover:bg-surface-secondary -mx-2 px-2 py-1 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(p.total_project_cost)}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {p.priority_score}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-surface rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Recent Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-sm text-text-muted">
            No activity yet. Start by adding a project or organization.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-sm">
                <span className="text-text-muted text-xs w-20 flex-shrink-0">
                  {new Date(entry.created_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-text-secondary">
                  {entry.action} — {entry.entity_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{sub}</p>
    </div>
  );
}
