import type { Project, Contact, ScoreBreakdown, Sector } from "@/lib/types";
import { SECTORS } from "@/lib/config/sectors";
import {
  PREFERRED_DEAL_MIN,
  PREFERRED_DEAL_MAX,
  DEAL_ABSOLUTE_MIN,
  DC_TOP_MARKETS,
} from "@/lib/config/constants";

// ============================================================
// Deterministic Project Scoring Engine (0-100)
// 6 weighted factors
// ============================================================

const WEIGHTS = {
  sector_fit: 25,
  deal_size_fit: 20,
  capital_gap_clarity: 15,
  geographic_desirability: 15,
  contact_quality: 15,
  timing_urgency: 10,
} as const;

/** Score a project on all 6 dimensions */
export function scoreProject(
  project: Project,
  contacts?: Contact[],
): ScoreBreakdown {
  const sector_fit = scoreSectorFit(project.sector);
  const deal_size_fit = scoreDealSize(project.total_project_cost);
  const capital_gap_clarity = scoreGapClarity(project);
  const geographic_desirability = scoreGeography(project);
  const contact_quality = scoreContacts(contacts ?? []);
  const timing_urgency = scoreTiming(project.target_close_date);

  const total =
    sector_fit + deal_size_fit + capital_gap_clarity +
    geographic_desirability + contact_quality + timing_urgency;

  return {
    sector_fit,
    deal_size_fit,
    capital_gap_clarity,
    geographic_desirability,
    contact_quality,
    timing_urgency,
    total,
  };
}

// --- Factor 1: Sector Priority Fit (0-25) ---
function scoreSectorFit(sector: Sector): number {
  const config = SECTORS[sector];
  if (!config) return 0;
  // scoreWeight is 55-100, map to 0-25
  return Math.round((config.scoreWeight / 100) * WEIGHTS.sector_fit);
}

// --- Factor 2: Deal Size Fit (0-20) ---
function scoreDealSize(cost: number | null): number {
  if (!cost || cost <= 0) return 2; // unknown = minimal score
  if (cost < DEAL_ABSOLUTE_MIN) return 3; // too small
  if (cost >= PREFERRED_DEAL_MIN && cost <= PREFERRED_DEAL_MAX) return WEIGHTS.deal_size_fit; // sweet spot
  // Outside sweet spot but acceptable
  if (cost < PREFERRED_DEAL_MIN) {
    // $5M-$20M — scale linearly
    const ratio = (cost - DEAL_ABSOLUTE_MIN) / (PREFERRED_DEAL_MIN - DEAL_ABSOLUTE_MIN);
    return Math.round(10 + ratio * 10);
  }
  // > $250M — still good, slight penalty for complexity
  if (cost <= 500_000_000) return 17;
  return 14; // mega deals > $500M
}

// --- Factor 3: Capital Gap Clarity (0-15) ---
function scoreGapClarity(project: Project): number {
  let score = 0;
  if (project.total_project_cost && project.total_project_cost > 0) score += 3;
  if (project.debt_sought !== null && project.debt_sought >= 0) score += 3;
  if (project.equity_sought !== null && project.equity_sought >= 0) score += 3;
  if (project.debt_secured !== null) score += 2;
  if (project.equity_secured !== null) score += 2;
  if (project.capital_type) score += 2;
  return Math.min(score, WEIGHTS.capital_gap_clarity);
}

// --- Factor 4: Geographic Desirability (0-15) ---
function scoreGeography(project: Project): number {
  const state = project.location_state;
  const city = project.location_city;
  if (!state) return 3; // unknown location

  let score = 8; // US project baseline

  // Tier 1 states for CRE/DC
  const tier1States = ["VA", "TX", "CA", "NY", "FL", "AZ", "GA", "IL", "NC", "CO"];
  if (tier1States.includes(state)) score += 3;

  // Data center top markets
  if (project.sector === "data_center" && city) {
    const isTopDCMarket = DC_TOP_MARKETS.some(
      (m) => city.toLowerCase().includes(m.toLowerCase()) ||
             m.toLowerCase().includes(city.toLowerCase())
    );
    if (isTopDCMarket) score += 4;
  }

  return Math.min(score, WEIGHTS.geographic_desirability);
}

// --- Factor 5: Contact Quality (0-15) ---
function scoreContacts(contacts: Contact[]): number {
  if (contacts.length === 0) return 3;

  let score = 5; // have at least one contact

  const hasDM = contacts.some((c) => c.is_decision_maker);
  if (hasDM) score += 4;

  const warmOrHot = contacts.some(
    (c) => c.relationship_status === "warm" || c.relationship_status === "hot" || c.relationship_status === "active"
  );
  if (warmOrHot) score += 3;

  const hasEmail = contacts.some((c) => c.email);
  if (hasEmail) score += 2;

  const hasPhone = contacts.some((c) => c.phone);
  if (hasPhone) score += 1;

  return Math.min(score, WEIGHTS.contact_quality);
}

// --- Factor 6: Timing Urgency (0-10) ---
function scoreTiming(targetCloseDate: string | null): number {
  if (!targetCloseDate) return 3; // no date = low urgency

  const now = new Date();
  const close = new Date(targetCloseDate);
  const daysUntilClose = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilClose < 0) return 2; // past due
  if (daysUntilClose <= 30) return 10; // imminent
  if (daysUntilClose <= 60) return 9;
  if (daysUntilClose <= 90) return 8;
  if (daysUntilClose <= 120) return 7;
  if (daysUntilClose <= 180) return 6;
  if (daysUntilClose <= 365) return 5;
  return 4; // > 1 year out
}

export { WEIGHTS as SCORE_WEIGHTS };
