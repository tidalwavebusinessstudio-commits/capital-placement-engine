// ============================================================
// Workflow Rules — Automated alerts and follow-up logic
// ============================================================

import type { Project, Outreach, Contact, Opportunity } from "@/lib/types";
import { STAGES } from "@/lib/config/stages";

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertCategory = "stale_deal" | "follow_up" | "stage_nudge" | "missing_data" | "opportunity" | "compliance";

export interface WorkflowAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  entity_type: "project" | "contact" | "outreach" | "opportunity";
  entity_id: string;
  entity_name: string;
  action_label: string;
  action_href: string;
  created_at: string;
}

// --- Stale Deal Detection ---
const STALE_DAYS: Record<string, number> = {
  discovered: 3,
  qualifying: 5,
  engaged: 7,
  submitted: 10,
  under_review: 14,
  closing: 7,
};

export function detectStaleDeals(projects: Project[]): WorkflowAlert[] {
  const now = Date.now();
  const alerts: WorkflowAlert[] = [];

  for (const p of projects) {
    if (p.stage === "dead" || p.stage === "closed" || p.archived_at) continue;

    const staleDays = STALE_DAYS[p.stage] ?? 7;
    const lastUpdated = new Date(p.updated_at).getTime();
    const daysSince = Math.floor((now - lastUpdated) / (24 * 60 * 60 * 1000));

    if (daysSince >= staleDays) {
      const severity: AlertSeverity = daysSince >= staleDays * 2 ? "critical" : "warning";
      alerts.push({
        id: `stale-${p.id}`,
        category: "stale_deal",
        severity,
        title: `${p.name} — stale ${daysSince}d`,
        description: `This deal has been in "${STAGES[p.stage]?.label}" for ${daysSince} days without updates. Typical max is ${staleDays} days.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Update Deal",
        action_href: `/projects/${p.id}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts.sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}

// --- Follow-Up Reminders ---
export function detectFollowUpNeeded(
  projects: Project[],
  outreach: Outreach[]
): WorkflowAlert[] {
  const now = Date.now();
  const alerts: WorkflowAlert[] = [];

  for (const p of projects) {
    if (p.stage === "dead" || p.stage === "closed" || p.archived_at) continue;

    // Find the latest outreach for this project
    const projectOutreach = outreach
      .filter((o) => o.project_id === p.id && o.status !== "draft")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (projectOutreach.length === 0 && p.stage !== "discovered") {
      // Active deal with no outreach
      alerts.push({
        id: `no-outreach-${p.id}`,
        category: "follow_up",
        severity: "warning",
        title: `${p.name} — no outreach sent`,
        description: `This deal is in "${STAGES[p.stage]?.label}" but has no outreach history. Send an intro email or log a call.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Compose Outreach",
        action_href: `/outreach/compose?project=${p.id}`,
        created_at: new Date().toISOString(),
      });
      continue;
    }

    const lastOutreach = projectOutreach[0];
    if (!lastOutreach) continue;

    const daysSinceOutreach = Math.floor(
      (now - new Date(lastOutreach.created_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    // If last outreach was sent but no reply after 3+ days, suggest follow-up
    if (
      (lastOutreach.status === "sent" || lastOutreach.status === "delivered" || lastOutreach.status === "opened") &&
      daysSinceOutreach >= 3
    ) {
      alerts.push({
        id: `followup-${p.id}`,
        category: "follow_up",
        severity: daysSinceOutreach >= 7 ? "warning" : "info",
        title: `${p.name} — follow up (${daysSinceOutreach}d)`,
        description: `Last outreach was ${daysSinceOutreach} days ago (${lastOutreach.status}). Time for a follow-up.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Send Follow-Up",
        action_href: `/outreach/compose?project=${p.id}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// --- Stage Nudge Suggestions ---
export function detectStageNudges(projects: Project[]): WorkflowAlert[] {
  const alerts: WorkflowAlert[] = [];

  for (const p of projects) {
    if (p.stage === "dead" || p.stage === "closed" || p.archived_at) continue;

    // Suggest advancing if score is high and stage is early
    const stageOrder = STAGES[p.stage]?.order ?? 0;

    if (p.priority_score >= 80 && stageOrder <= 2) {
      alerts.push({
        id: `nudge-advance-${p.id}`,
        category: "stage_nudge",
        severity: "info",
        title: `${p.name} — high score, early stage`,
        description: `Score is ${p.priority_score}/100 but still in "${STAGES[p.stage]?.label}". Consider advancing this deal.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Review Deal",
        action_href: `/projects/${p.id}`,
        created_at: new Date().toISOString(),
      });
    }

    // Suggest killing if score is very low and stage is past qualifying
    if (p.priority_score < 30 && stageOrder >= 3) {
      alerts.push({
        id: `nudge-kill-${p.id}`,
        category: "stage_nudge",
        severity: "warning",
        title: `${p.name} — low score, advanced stage`,
        description: `Score is only ${p.priority_score}/100 but in "${STAGES[p.stage]?.label}". Consider marking as dead to focus on better opportunities.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Review Deal",
        action_href: `/projects/${p.id}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// --- Missing Data Alerts ---
export function detectMissingData(projects: Project[]): WorkflowAlert[] {
  const alerts: WorkflowAlert[] = [];

  for (const p of projects) {
    if (p.stage === "dead" || p.stage === "closed" || p.archived_at) continue;

    const missing: string[] = [];
    if (!p.total_project_cost) missing.push("total cost");
    if (!p.capital_type) missing.push("capital type");
    if (!p.location_city || !p.location_state) missing.push("location");
    if (!p.description) missing.push("description");
    if (!p.organization_id) missing.push("sponsor/org");

    // Only alert if deal is past qualifying and still missing key fields
    const stageOrder = STAGES[p.stage]?.order ?? 0;
    if (missing.length > 0 && stageOrder >= 2) {
      alerts.push({
        id: `missing-${p.id}`,
        category: "missing_data",
        severity: missing.length >= 3 ? "warning" : "info",
        title: `${p.name} — missing ${missing.length} field${missing.length > 1 ? "s" : ""}`,
        description: `Missing: ${missing.join(", ")}. Complete data improves scoring accuracy and outreach quality.`,
        entity_type: "project",
        entity_id: p.id,
        entity_name: p.name,
        action_label: "Edit Project",
        action_href: `/projects/${p.id}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// --- Opportunity Alerts ---
export function detectOpportunityAlerts(
  opportunities: Opportunity[],
  projects: Project[]
): WorkflowAlert[] {
  const alerts: WorkflowAlert[] = [];
  const now = Date.now();

  for (const opp of opportunities) {
    if (opp.status === "closed" || opp.status === "lost") continue;

    const daysSinceUpdate = Math.floor(
      (now - new Date(opp.updated_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    // Term sheet stage without update for 5+ days
    if (opp.status === "term_sheet" && daysSinceUpdate >= 5) {
      const project = projects.find((p) => p.id === opp.project_id);
      alerts.push({
        id: `opp-stale-${opp.id}`,
        category: "opportunity",
        severity: "warning",
        title: `Term sheet stale — ${project?.name ?? "Unknown"}`,
        description: `Term sheet has been pending for ${daysSinceUpdate} days. Follow up with the capital source.`,
        entity_type: "opportunity",
        entity_id: opp.id,
        entity_name: project?.name ?? "Unknown Project",
        action_label: "View Opportunity",
        action_href: `/opportunities`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// --- Master Alert Generator ---
export function generateAllAlerts(
  projects: Project[],
  outreach: Outreach[],
  opportunities: Opportunity[]
): WorkflowAlert[] {
  const all = [
    ...detectStaleDeals(projects),
    ...detectFollowUpNeeded(projects, outreach),
    ...detectStageNudges(projects),
    ...detectMissingData(projects),
    ...detectOpportunityAlerts(opportunities, projects),
  ];

  // Sort by severity, then by category
  const sevOrder = { critical: 0, warning: 1, info: 2 };
  return all.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
}
