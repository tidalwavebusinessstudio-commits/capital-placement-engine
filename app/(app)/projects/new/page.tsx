"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SECTOR_LIST } from "@/lib/config/sectors";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { scoreProject } from "@/lib/scoring/projectScorer";
import type { ProjectType, CapitalType, Sector, SourceType, Project } from "@/lib/types";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "ground_up", label: "Ground Up" },
  { value: "acquisition", label: "Acquisition" },
  { value: "refinance", label: "Refinance" },
  { value: "expansion", label: "Expansion" },
  { value: "renovation", label: "Renovation" },
  { value: "recapitalization", label: "Recapitalization" },
];

const CAPITAL_TYPES: { value: CapitalType; label: string }[] = [
  { value: "debt", label: "Debt Only" },
  { value: "equity", label: "Equity Only" },
  { value: "both", label: "Debt + Equity" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { organizations, addProject } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const totalCost = Number(form.get("total_project_cost")) || null;
    const debtSought = Number(form.get("debt_sought")) || null;
    const equitySought = Number(form.get("equity_sought")) || null;
    const debtSecured = Number(form.get("debt_secured")) || null;
    const equitySecured = Number(form.get("equity_secured")) || null;
    const fundingGap = totalCost ? totalCost - (debtSecured ?? 0) - (equitySecured ?? 0) : null;
    const feePct = Number(form.get("estimated_fee_pct")) || null;
    const feeAmount = totalCost && feePct ? totalCost * (feePct / 100) : null;

    // Build a partial project to score
    const partialProject: Partial<Project> = {
      sector: form.get("sector") as Sector,
      total_project_cost: totalCost,
      funding_gap: fundingGap,
      debt_sought: debtSought,
      equity_sought: equitySought,
      debt_secured: debtSecured,
      equity_secured: equitySecured,
      location_state: (form.get("location_state") as string) || null,
      target_close_date: (form.get("target_close_date") as string) || null,
      capital_type: (form.get("capital_type") as CapitalType) || null,
    };

    const scoreBreakdown = scoreProject(partialProject as Project);

    const project: Project = {
      id: `proj-${Date.now()}`,
      name: form.get("name") as string,
      organization_id: (form.get("organization_id") as string) || null,
      sector: form.get("sector") as Sector,
      project_type: (form.get("project_type") as ProjectType) || null,
      description: (form.get("description") as string) || null,
      location_city: (form.get("location_city") as string) || null,
      location_state: (form.get("location_state") as string) || null,
      location_address: null,
      total_project_cost: totalCost,
      debt_sought: debtSought,
      equity_sought: equitySought,
      debt_secured: debtSecured,
      equity_secured: equitySecured,
      funding_gap: fundingGap,
      capital_type: (form.get("capital_type") as CapitalType) || null,
      stage: "discovered",
      priority_score: scoreBreakdown.total,
      score_breakdown: scoreBreakdown,
      target_close_date: (form.get("target_close_date") as string) || null,
      construction_start: null,
      estimated_fee_pct: feePct,
      estimated_fee_amount: feeAmount,
      kevin_share_pct: 50,
      kevin_estimated_fee: feeAmount ? feeAmount * 0.5 : null,
      source_type: (form.get("source_type") as SourceType) || null,
      source_url: (form.get("source_url") as string) || null,
      source_record_id: null,
      notes: (form.get("notes") as string) || null,
      tags: [],
      metadata: {},
      created_by: null,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addProject(project);
    toast(`${project.name} created — Score: ${project.priority_score}`);
    router.push("/projects");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Projects
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Project Details</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="e.g. Vertex Ashburn Campus Phase 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-text-primary mb-1">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                id="sector"
                name="sector"
                required
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                <option value="">Select sector...</option>
                {SECTOR_LIST.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project_type" className="block text-sm font-medium text-text-primary mb-1">
                Project Type
              </label>
              <select
                id="project_type"
                name="project_type"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                <option value="">Select type...</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="organization_id" className="block text-sm font-medium text-text-primary mb-1">
              Sponsor / Developer
            </label>
            <select
              id="organization_id"
              name="organization_id"
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="">Select organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location_city" className="block text-sm font-medium text-text-primary mb-1">City</label>
              <input id="location_city" name="location_city" type="text"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
            <div>
              <label htmlFor="location_state" className="block text-sm font-medium text-text-primary mb-1">State</label>
              <input id="location_state" name="location_state" type="text" maxLength={2}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand uppercase" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea id="description" name="description" rows={3}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
              placeholder="Project overview, key details..." />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Capital Structure</h2>

          <div>
            <label htmlFor="total_project_cost" className="block text-sm font-medium text-text-primary mb-1">
              Total Project Cost ($)
            </label>
            <input id="total_project_cost" name="total_project_cost" type="number" min="0" step="1000"
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="e.g. 180000000" />
          </div>

          <div>
            <label htmlFor="capital_type" className="block text-sm font-medium text-text-primary mb-1">Capital Type Sought</label>
            <select id="capital_type" name="capital_type"
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand">
              <option value="">Select type...</option>
              {CAPITAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="debt_sought" className="block text-sm font-medium text-text-primary mb-1">Debt Sought ($)</label>
              <input id="debt_sought" name="debt_sought" type="number" min="0" step="1000"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
            <div>
              <label htmlFor="equity_sought" className="block text-sm font-medium text-text-primary mb-1">Equity Sought ($)</label>
              <input id="equity_sought" name="equity_sought" type="number" min="0" step="1000"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="debt_secured" className="block text-sm font-medium text-text-primary mb-1">Debt Secured ($)</label>
              <input id="debt_secured" name="debt_secured" type="number" min="0" step="1000"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
            <div>
              <label htmlFor="equity_secured" className="block text-sm font-medium text-text-primary mb-1">Equity Secured ($)</label>
              <input id="equity_secured" name="equity_secured" type="number" min="0" step="1000"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
          </div>
        </div>

        {/* Timing + Fees */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Timing & Fees</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_close_date" className="block text-sm font-medium text-text-primary mb-1">Target Close Date</label>
              <input id="target_close_date" name="target_close_date" type="date"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
            <div>
              <label htmlFor="estimated_fee_pct" className="block text-sm font-medium text-text-primary mb-1">Estimated Fee (%)</label>
              <input id="estimated_fee_pct" name="estimated_fee_pct" type="number" min="0" max="100" step="0.1"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="e.g. 5.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="source_type" className="block text-sm font-medium text-text-primary mb-1">Source</label>
              <select id="source_type" name="source_type"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand">
                <option value="">Select source...</option>
                <option value="news">News</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="public_filing">Public Filing</option>
                <option value="manual">Manual Entry</option>
              </select>
            </div>
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-text-primary mb-1">Source URL</label>
              <input id="source_url" name="source_url" type="url"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand" />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea id="notes" name="notes" rows={3}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Project"}
          </button>
          <Link href="/projects" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
