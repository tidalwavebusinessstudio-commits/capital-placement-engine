"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { getSectorConfig } from "@/lib/config/sectors";
import { getStageConfig } from "@/lib/config/stages";
import { formatCurrency } from "@/lib/utils/format";

const stageBgClass: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  violet: "bg-violet-100 text-violet-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600 font-bold";
  if (score >= 60) return "text-blue-600 font-semibold";
  if (score >= 40) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

export default function ProjectsPage() {
  const { projects } = useData();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const filtered = useMemo(() => {
    let list = [...projects].sort((a, b) => b.priority_score - a.priority_score);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.location_city?.toLowerCase().includes(q) ||
        p.location_state?.toLowerCase().includes(q)
      );
    }
    if (sectorFilter) list = list.filter((p) => p.sector === sectorFilter);
    if (stageFilter) list = list.filter((p) => p.stage === stageFilter);
    return list;
  }, [projects, search, sectorFilter, stageFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} in pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projects/pipeline"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-secondary"
          >
            Pipeline View
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            <span aria-hidden>+</span> New Project
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 max-w-xs px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All Sectors</option>
          <option value="data_center">🏢 Data Centers</option>
          <option value="cre">🏗️ CRE</option>
          <option value="hospitality">🏨 Hospitality</option>
          <option value="energy">⚡ Energy</option>
          <option value="infrastructure">🛣️ Infrastructure</option>
          <option value="manufacturing">🏭 Manufacturing</option>
          <option value="tech">💻 Technology</option>
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All Stages</option>
          <option value="discovered">Discovered</option>
          <option value="qualifying">Qualifying</option>
          <option value="engaged">Engaged</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="closing">Closing</option>
          <option value="closed">Closed</option>
          <option value="dead">Dead</option>
        </select>
        {(search || sectorFilter || stageFilter) && (
          <button
            onClick={() => { setSearch(""); setSectorFilter(""); setStageFilter(""); }}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">Total Cost</th>
              <th className="px-4 py-3 text-right">Funding Gap</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const sectorCfg = getSectorConfig(p.sector);
              const stageCfg = getStageConfig(p.stage);
              const badgeClass = stageBgClass[stageCfg.color] ?? "bg-slate-100 text-slate-700";

              return (
                <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    <span className="mr-1.5">{sectorCfg.icon}</span>
                    {sectorCfg.label}
                  </td>
                  <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                    {[p.location_city, p.location_state].filter(Boolean).join(", ") || "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary tabular-nums">
                    {formatCurrency(p.total_project_cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary tabular-nums">
                    {formatCurrency(p.funding_gap)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                      {stageCfg.label}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${scoreColor(p.priority_score)}`}>
                    {p.priority_score}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No projects match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
