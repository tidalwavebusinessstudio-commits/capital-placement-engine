import type { ProjectStage } from "@/lib/types";

export interface StageConfig {
  id: ProjectStage;
  label: string;
  order: number;
  color: string;
  description: string;
  closeProbability: number; // 0-100%, used for fee forecasting
}

export const STAGES: Record<ProjectStage, StageConfig> = {
  discovered: {
    id: "discovered",
    label: "Discovered",
    order: 1,
    color: "slate",
    description: "Project identified from source, not yet reviewed",
    closeProbability: 5,
  },
  qualifying: {
    id: "qualifying",
    label: "Qualifying",
    order: 2,
    color: "blue",
    description: "Gathering information, scoring, assessing fit",
    closeProbability: 10,
  },
  engaged: {
    id: "engaged",
    label: "Engaged",
    order: 3,
    color: "indigo",
    description: "Active conversation with sponsor/developer",
    closeProbability: 25,
  },
  submitted: {
    id: "submitted",
    label: "Submitted",
    order: 4,
    color: "violet",
    description: "Deal submitted to capital partners through firm",
    closeProbability: 40,
  },
  under_review: {
    id: "under_review",
    label: "Under Review",
    order: 5,
    color: "purple",
    description: "Capital partners reviewing the deal",
    closeProbability: 55,
  },
  closing: {
    id: "closing",
    label: "Closing",
    order: 6,
    color: "amber",
    description: "Terms agreed, working toward close",
    closeProbability: 80,
  },
  closed: {
    id: "closed",
    label: "Closed",
    order: 7,
    color: "green",
    description: "Deal closed, fee earned",
    closeProbability: 100,
  },
  dead: {
    id: "dead",
    label: "Dead",
    order: 8,
    color: "red",
    description: "Deal lost or abandoned",
    closeProbability: 0,
  },
};

export const ACTIVE_STAGES: ProjectStage[] = [
  "discovered", "qualifying", "engaged", "submitted", "under_review", "closing",
];

export const PIPELINE_STAGES: ProjectStage[] = [
  "discovered", "qualifying", "engaged", "submitted", "under_review", "closing", "closed",
];

export const STAGE_LIST = Object.values(STAGES).sort((a, b) => a.order - b.order);

export function getStageConfig(stage: ProjectStage): StageConfig {
  return STAGES[stage];
}
