"use client";

import Badge from "./Badge";
import { STAGES } from "@/lib/config/stages";
import type { ProjectStage, RelationshipStatus } from "@/lib/types";

const RELATIONSHIP_COLORS: Record<RelationshipStatus, string> = {
  cold: "slate",
  warm: "amber",
  hot: "red",
  active: "green",
  inactive: "slate",
};

const SOURCE_COLORS: Record<string, string> = {
  manual: "slate",
  scraper: "cyan",
  referral: "green",
  newsletter: "violet",
  ai: "indigo",
  import: "orange",
};

const OUTREACH_COLORS: Record<string, string> = {
  draft: "slate",
  pending_approval: "amber",
  approved: "blue",
  sent: "green",
  replied: "indigo",
  bounced: "red",
  opted_out: "red",
};

interface StatusBadgeProps {
  status: string;
  type: "stage" | "relationship" | "source" | "outreach";
  size?: "sm" | "md";
}

function getColor(status: string, type: StatusBadgeProps["type"]): string {
  switch (type) {
    case "stage": {
      const stage = STAGES[status as ProjectStage];
      return stage?.color ?? "slate";
    }
    case "relationship":
      return RELATIONSHIP_COLORS[status as RelationshipStatus] ?? "slate";
    case "source":
      return SOURCE_COLORS[status] ?? "slate";
    case "outreach":
      return OUTREACH_COLORS[status] ?? "slate";
    default:
      return "slate";
  }
}

function getLabel(status: string, type: StatusBadgeProps["type"]): string {
  if (type === "stage") {
    const stage = STAGES[status as ProjectStage];
    return stage?.label ?? status;
  }
  // Convert snake_case to Title Case
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, type, size = "sm" }: StatusBadgeProps) {
  return (
    <Badge
      label={getLabel(status, type)}
      color={getColor(status, type)}
      size={size}
    />
  );
}
