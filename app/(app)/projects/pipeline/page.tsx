"use client";

import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { STAGES, PIPELINE_STAGES } from "@/lib/config/stages";
import { SECTORS } from "@/lib/config/sectors";
import { formatCurrency } from "@/lib/utils/format";
import type { Project, ProjectStage } from "@/lib/types";
import ScoreGauge from "@/components/ui/ScoreGauge";

function KanbanColumn({
  stage,
  projects,
  onAdvance,
}: {
  stage: ProjectStage;
  projects: Project[];
  onAdvance: (projectId: string, toStage: ProjectStage) => void;
}) {
  const config = STAGES[stage];
  const totalValue = projects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
  const stageIndex = PIPELINE_STAGES.indexOf(stage);
  const nextStage = stageIndex < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[stageIndex + 1] : null;

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{config.label}</h3>
          <span className="text-xs font-medium bg-surface-secondary text-text-secondary px-1.5 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
        <span className="text-xs text-text-muted">{formatCurrency(totalValue)}</span>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[200px]">
        {projects.map((project) => {
          const sectorConfig = SECTORS[project.sector];
          return (
            <div
              key={project.id}
              className="bg-surface rounded-lg border border-border p-3 hover:border-brand/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link href={`/projects/${project.id}`}>
                  <h4 className="text-sm font-medium text-text-primary leading-tight line-clamp-2 hover:underline">
                    {project.name}
                  </h4>
                </Link>
                <ScoreGauge score={project.priority_score} />
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">{sectorConfig?.icon}</span>
                <span className="text-xs text-text-secondary">{sectorConfig?.label}</span>
              </div>

              {project.location_city && project.location_state && (
                <p className="text-xs text-text-muted mb-2">
                  {project.location_city}, {project.location_state}
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-primary">
                  {project.total_project_cost ? formatCurrency(project.total_project_cost) : "—"}
                </span>
                {project.funding_gap ? (
                  <span className="text-xs text-red-500 font-medium">
                    Gap: {formatCurrency(project.funding_gap)}
                  </span>
                ) : null}
              </div>

              {project.target_close_date && (
                <p className="text-xs text-text-muted mb-2">
                  Target: {new Date(project.target_close_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              )}

              {/* Stage transition buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
                {nextStage && stage !== "closed" && (
                  <button
                    onClick={() => onAdvance(project.id, nextStage)}
                    className="flex-1 text-xs font-medium text-brand hover:bg-brand/10 px-2 py-1 rounded transition-colors"
                  >
                    → {STAGES[nextStage].label}
                  </button>
                )}
                {stage !== "dead" && stage !== "closed" && (
                  <button
                    onClick={() => onAdvance(project.id, "dead")}
                    className="text-xs text-text-muted hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Mark as dead"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs">
            No projects
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { projects, updateProjectStage } = useData();
  const { toast } = useToast();

  const activeProjects = projects.filter((p) => p.stage !== "dead");

  // Group projects by stage
  const byStage: Record<ProjectStage, Project[]> = {} as Record<ProjectStage, Project[]>;
  for (const stage of PIPELINE_STAGES) {
    byStage[stage] = [];
  }
  for (const p of activeProjects) {
    if (byStage[p.stage]) {
      byStage[p.stage].push(p);
    }
  }
  // Sort each column by score desc
  for (const stage of PIPELINE_STAGES) {
    byStage[stage].sort((a, b) => b.priority_score - a.priority_score);
  }

  const totalPipeline = activeProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
  const totalGap = activeProjects.reduce((s, p) => s + (p.funding_gap ?? 0), 0);

  function handleAdvance(projectId: string, toStage: ProjectStage) {
    const project = projects.find((p) => p.id === projectId);
    updateProjectStage(projectId, toStage);
    toast(
      toStage === "dead"
        ? `${project?.name} marked as dead`
        : `${project?.name} → ${STAGES[toStage].label}`
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {activeProjects.length} projects &middot; {formatCurrency(totalPipeline)} total &middot;{" "}
            <span className="text-red-500">{formatCurrency(totalGap)} gap</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-secondary"
          >
            Table View
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              projects={byStage[stage]}
              onAdvance={handleAdvance}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
