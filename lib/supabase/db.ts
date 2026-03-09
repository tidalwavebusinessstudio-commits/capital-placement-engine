// ============================================================
// Data Access Layer — Supabase queries with mock fallback
// ============================================================
// Every function checks if Supabase is configured. If not, returns mock data.
// This makes the app work identically in dev (no DB) and production (real DB).

import { createClient } from "@/lib/supabase/server";
import { MOCK_ORGANIZATIONS, MOCK_CONTACTS, MOCK_PROJECTS, MOCK_ACTIVITY } from "@/lib/mock-data";
import {
  MOCK_SOURCE_RECORDS, MOCK_OUTREACH, MOCK_COMPLIANCE_LOG,
  MOCK_OPPORTUNITIES, MOCK_NEWSLETTERS,
} from "@/lib/mock-data-extended";
import type {
  Organization, Contact, Project, SourceRecord,
  Opportunity, Outreach, Newsletter, ComplianceLogEntry,
  ActivityLogEntry,
} from "@/lib/types";

// Check if Supabase env vars are configured
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// ============================================================
// Organizations
// ============================================================

export async function getOrganizations(): Promise<Organization[]> {
  if (!isSupabaseConfigured()) return MOCK_ORGANIZATIONS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) { console.error("getOrganizations error:", error); return []; }
  return data as Organization[];
}

export async function getOrganization(id: string): Promise<Organization | null> {
  if (!isSupabaseConfigured()) return MOCK_ORGANIZATIONS.find((o) => o.id === id) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();
  if (error) return null;
  return data as Organization;
}

export async function insertOrganization(org: Omit<Organization, "id" | "created_at" | "updated_at">): Promise<Organization | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").insert(org).select().single();
  if (error) { console.error("insertOrganization error:", error); return null; }
  return data as Organization;
}

// ============================================================
// Contacts
// ============================================================

export async function getContacts(): Promise<Contact[]> {
  if (!isSupabaseConfigured()) return MOCK_CONTACTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, organization:organizations(*)")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) { console.error("getContacts error:", error); return []; }
  return data as Contact[];
}

export async function getContact(id: string): Promise<Contact | null> {
  if (!isSupabaseConfigured()) return MOCK_CONTACTS.find((c) => c.id === id) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, organization:organizations(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Contact;
}

export async function getContactsForOrg(orgId: string): Promise<Contact[]> {
  if (!isSupabaseConfigured()) return MOCK_CONTACTS.filter((c) => c.organization_id === orgId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", orgId)
    .is("archived_at", null)
    .order("last_name");
  if (error) return [];
  return data as Contact[];
}

export async function insertContact(contact: Omit<Contact, "id" | "created_at" | "updated_at">): Promise<Contact | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("contacts").insert(contact).select().single();
  if (error) { console.error("insertContact error:", error); return null; }
  return data as Contact;
}

// ============================================================
// Projects
// ============================================================

export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return MOCK_PROJECTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, organization:organizations(*)")
    .is("archived_at", null)
    .order("priority_score", { ascending: false });

  if (error) { console.error("getProjects error:", error); return []; }
  return data as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return MOCK_PROJECTS.find((p) => p.id === id) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, organization:organizations(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Project;
}

export async function getProjectsForOrg(orgId: string): Promise<Project[]> {
  if (!isSupabaseConfigured()) return MOCK_PROJECTS.filter((p) => p.organization_id === orgId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .is("archived_at", null)
    .order("priority_score", { ascending: false });
  if (error) return [];
  return data as Project[];
}

export async function insertProject(project: Omit<Project, "id" | "created_at" | "updated_at" | "funding_gap">): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert(project).select().single();
  if (error) { console.error("insertProject error:", error); return null; }
  return data as Project;
}

export async function updateProjectStage(id: string, stage: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ stage }).eq("id", id);
  if (error) { console.error("updateProjectStage error:", error); return false; }
  return true;
}

// ============================================================
// Source Records
// ============================================================

export async function getSourceRecords(): Promise<SourceRecord[]> {
  if (!isSupabaseConfigured()) return MOCK_SOURCE_RECORDS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_records")
    .select("*")
    .order("relevance_score", { ascending: false });
  if (error) return [];
  return data as SourceRecord[];
}

export async function getSourceRecord(id: string): Promise<SourceRecord | null> {
  if (!isSupabaseConfigured()) return MOCK_SOURCE_RECORDS.find((s) => s.id === id) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("source_records").select("*").eq("id", id).single();
  if (error) return null;
  return data as SourceRecord;
}

// ============================================================
// Opportunities
// ============================================================

export async function getOpportunities(): Promise<Opportunity[]> {
  if (!isSupabaseConfigured()) return MOCK_OPPORTUNITIES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, project:projects(*)")
    .order("updated_at", { ascending: false });
  if (error) return [];
  return data as Opportunity[];
}

export async function getOpportunitiesForProject(projectId: string): Promise<Opportunity[]> {
  if (!isSupabaseConfigured()) return MOCK_OPPORTUNITIES.filter((o) => o.project_id === projectId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Opportunity[];
}

// ============================================================
// Outreach
// ============================================================

export async function getOutreach(): Promise<Outreach[]> {
  if (!isSupabaseConfigured()) return MOCK_OUTREACH;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach")
    .select("*, contact:contacts(*), project:projects(*)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Outreach[];
}

export async function getOutreachForContact(contactId: string): Promise<Outreach[]> {
  if (!isSupabaseConfigured()) return MOCK_OUTREACH.filter((o) => o.contact_id === contactId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Outreach[];
}

export async function getOutreachForProject(projectId: string): Promise<Outreach[]> {
  if (!isSupabaseConfigured()) return MOCK_OUTREACH.filter((o) => o.project_id === projectId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Outreach[];
}

export async function insertOutreach(outreach: Omit<Outreach, "id" | "created_at">): Promise<Outreach | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("outreach").insert(outreach).select().single();
  if (error) { console.error("insertOutreach error:", error); return null; }
  return data as Outreach;
}

// ============================================================
// Newsletters
// ============================================================

export async function getNewsletters(): Promise<Newsletter[]> {
  if (!isSupabaseConfigured()) return MOCK_NEWSLETTERS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Newsletter[];
}

// ============================================================
// Compliance Log
// ============================================================

export async function getComplianceLog(): Promise<ComplianceLogEntry[]> {
  if (!isSupabaseConfigured()) return MOCK_COMPLIANCE_LOG;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("compliance_log")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as ComplianceLogEntry[];
}

export async function insertComplianceEntry(entry: Omit<ComplianceLogEntry, "id" | "created_at">): Promise<ComplianceLogEntry | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("compliance_log").insert(entry).select().single();
  if (error) { console.error("insertComplianceEntry error:", error); return null; }
  return data as ComplianceLogEntry;
}

// ============================================================
// Activity Log
// ============================================================

export async function getRecentActivity(limit: number = 20): Promise<ActivityLogEntry[]> {
  if (!isSupabaseConfigured()) return MOCK_ACTIVITY.slice(0, limit);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data as ActivityLogEntry[];
}

export async function insertActivity(entry: Omit<ActivityLogEntry, "id" | "created_at">): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  await supabase.from("activity_log").insert(entry);
}

// ============================================================
// Dashboard KPIs (aggregated)
// ============================================================

export async function getDashboardStats() {
  const projects = await getProjects();
  const activeProjects = projects.filter((p) => p.stage !== "dead" && p.stage !== "closed");

  const total_pipeline_value = activeProjects.reduce((s, p) => s + (p.total_project_cost ?? 0), 0);
  const estimated_total_fees = activeProjects.reduce((s, p) => s + (p.estimated_fee_amount ?? 0), 0);
  const kevin_estimated_share = activeProjects.reduce((s, p) => s + (p.kevin_estimated_fee ?? 0), 0);

  const projects_by_stage: Record<string, number> = {};
  const projects_by_sector: Record<string, number> = {};
  for (const p of activeProjects) {
    projects_by_stage[p.stage] = (projects_by_stage[p.stage] ?? 0) + 1;
    projects_by_sector[p.sector] = (projects_by_sector[p.sector] ?? 0) + 1;
  }

  return {
    total_pipeline_value,
    active_projects: activeProjects.length,
    projects_by_stage,
    projects_by_sector,
    estimated_total_fees,
    kevin_estimated_share,
    new_leads_this_week: 3,
    outreach_sent_this_week: 5,
    meetings_booked: 2,
  };
}
