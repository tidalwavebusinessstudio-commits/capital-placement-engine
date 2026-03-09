// ============================================================
// Capital Placement Engine — Core Type Definitions
// ============================================================

// --- Users ---
export type UserRole = "admin" | "placer" | "viewer" | "partner";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  supabase_auth_id: string | null;
  phone: string | null;
  firm_name: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// --- Organizations ---
export type OrgType = "sponsor" | "developer" | "lender" | "investor" | "government" | "other";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  sector: Sector | null;
  website: string | null;
  hq_city: string | null;
  hq_state: string | null;
  employee_count: number | null;
  annual_revenue_range: string | null;
  description: string | null;
  linkedin_url: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  source: string | null;
  created_by: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Contacts ---
export type RelationshipStatus = "cold" | "warm" | "hot" | "active" | "inactive";

export interface Contact {
  id: string;
  organization_id: string | null;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  is_decision_maker: boolean;
  relationship_status: RelationshipStatus;
  notes: string | null;
  tags: string[];
  source: string | null;
  created_by: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  organization?: Organization;
}

// --- Projects ---
export type Sector =
  | "data_center"
  | "cre"
  | "hospitality"
  | "energy"
  | "infrastructure"
  | "manufacturing"
  | "tech";

export type ProjectType =
  | "ground_up"
  | "acquisition"
  | "refinance"
  | "expansion"
  | "renovation"
  | "recapitalization";

export type ProjectStage =
  | "discovered"
  | "qualifying"
  | "engaged"
  | "submitted"
  | "under_review"
  | "closing"
  | "closed"
  | "dead";

export type CapitalType = "debt" | "equity" | "both";

export interface Project {
  id: string;
  name: string;
  organization_id: string | null;
  sector: Sector;
  project_type: ProjectType | null;
  description: string | null;
  location_city: string | null;
  location_state: string | null;
  location_address: string | null;

  // Financial
  total_project_cost: number | null;
  debt_sought: number | null;
  equity_sought: number | null;
  debt_secured: number | null;
  equity_secured: number | null;
  funding_gap: number | null;
  capital_type: CapitalType | null;

  // Pipeline
  stage: ProjectStage;
  priority_score: number;
  score_breakdown: ScoreBreakdown;

  // Timing
  target_close_date: string | null;
  construction_start: string | null;

  // Fees
  estimated_fee_pct: number | null;
  estimated_fee_amount: number | null;
  kevin_share_pct: number;
  kevin_estimated_fee: number | null;

  // Source
  source_type: SourceType | null;
  source_url: string | null;
  source_record_id: string | null;

  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_by: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  organization?: Organization;
  contacts?: Contact[];
}

export interface ScoreBreakdown {
  sector_fit: number;
  deal_size_fit: number;
  capital_gap_clarity: number;
  geographic_desirability: number;
  contact_quality: number;
  timing_urgency: number;
  total: number;
}

// --- Capital Gap ---
export type GapAssessment =
  | "fully_funded"
  | "nearly_funded"
  | "partially_funded"
  | "early_stage"
  | "unknown";

export interface CapitalGap {
  total_project_cost: number;
  debt_secured: number;
  equity_secured: number;
  total_secured: number;
  funding_gap: number;
  gap_percentage: number;
  debt_percentage: number;
  equity_percentage: number;
  gap_assessment: GapAssessment;
}

// --- Source Records ---
export type SourceType =
  | "rss"
  | "public_filing"
  | "news"
  | "linkedin"
  | "manual"
  | "csv_import"
  | "referral";

export type SourceStatus = "new" | "reviewed" | "converted" | "dismissed";

export interface SourceRecord {
  id: string;
  source_type: SourceType;
  title: string;
  url: string | null;
  raw_content: string | null;
  extracted_data: Record<string, unknown>;
  sector_guess: Sector | null;
  location_guess: string | null;
  amount_guess: number | null;
  relevance_score: number;
  status: SourceStatus;
  converted_project_id: string | null;
  dismissed_reason: string | null;
  created_at: string;
}

// --- Opportunities ---
export type OpportunityType = "debt_placement" | "equity_placement" | "co_invest";
export type OpportunityStatus =
  | "identified"
  | "approached"
  | "in_discussion"
  | "term_sheet"
  | "committed"
  | "closed"
  | "lost";

export interface Opportunity {
  id: string;
  project_id: string;
  capital_source_org_id: string | null;
  capital_source_contact_id: string | null;
  opportunity_type: OpportunityType;
  status: OpportunityStatus;
  amount: number | null;
  fee_pct: number | null;
  fee_amount: number | null;
  notes: string | null;
  lost_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  project?: Project;
}

// --- Outreach ---
export type OutreachChannel = "email" | "linkedin" | "phone" | "in_person" | "referral";
export type OutreachDirection = "outbound" | "inbound";
export type OutreachStatus =
  | "draft"
  | "pending_approval"
  | "sent"
  | "delivered"
  | "opened"
  | "replied"
  | "bounced";

export interface Outreach {
  id: string;
  contact_id: string | null;
  project_id: string | null;
  channel: OutreachChannel;
  direction: OutreachDirection;
  subject: string | null;
  body: string | null;
  template_id: string | null;
  status: OutreachStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  sequence_position: number | null;
  sequence_id: string | null;
  compliance_approved: boolean;
  compliance_approved_by: string | null;
  compliance_approved_at: string | null;
  created_by: string | null;
  created_at: string;
  // Joined
  contact?: Contact;
  project?: Project;
}

// --- Newsletters ---
export type NewsletterStatus = "draft" | "review" | "approved" | "scheduled" | "sent";

export interface Newsletter {
  id: string;
  title: string;
  subject_line: string | null;
  body_html: string | null;
  body_text: string | null;
  sector_focus: Sector[];
  status: NewsletterStatus;
  ai_draft: Record<string, unknown>;
  editor_notes: string | null;
  recipient_count: number;
  sent_at: string | null;
  scheduled_at: string | null;
  approved_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Compliance Log ---
export interface ComplianceLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  disclosure_text: string | null;
  firm_approval_required: boolean;
  firm_approved: boolean | null;
  firm_approved_by: string | null;
  firm_approved_at: string | null;
  created_at: string;
}

// --- Activity Log ---
export interface ActivityLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// --- Dashboard KPIs ---
export interface DashboardKPIs {
  total_pipeline_value: number;
  active_projects: number;
  projects_by_stage: Record<ProjectStage, number>;
  projects_by_sector: Record<Sector, number>;
  estimated_total_fees: number;
  kevin_estimated_share: number;
  new_leads_this_week: number;
  outreach_sent_this_week: number;
  meetings_booked: number;
}
