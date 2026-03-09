"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type {
  Organization, Contact, Project, SourceRecord,
  Opportunity, Outreach, ComplianceLogEntry, ActivityLogEntry,
  Newsletter, ProjectStage,
} from "@/lib/types";
import { MOCK_ORGANIZATIONS, MOCK_CONTACTS, MOCK_PROJECTS, MOCK_ACTIVITY } from "@/lib/mock-data";
import {
  MOCK_SOURCE_RECORDS, MOCK_OUTREACH, MOCK_COMPLIANCE_LOG,
  MOCK_OPPORTUNITIES, MOCK_NEWSLETTERS,
} from "@/lib/mock-data-extended";

// ============================================================
// State shape
// ============================================================
interface DataState {
  organizations: Organization[];
  contacts: Contact[];
  projects: Project[];
  sourceRecords: SourceRecord[];
  outreach: Outreach[];
  complianceLog: ComplianceLogEntry[];
  opportunities: Opportunity[];
  newsletters: Newsletter[];
  activity: ActivityLogEntry[];
}

// ============================================================
// Actions
// ============================================================
type Action =
  | { type: "ADD_ORGANIZATION"; payload: Organization }
  | { type: "ADD_CONTACT"; payload: Contact }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "ADD_OUTREACH"; payload: Outreach }
  | { type: "ADD_OPPORTUNITY"; payload: Opportunity }
  | { type: "ADD_SOURCE_RECORD"; payload: SourceRecord }
  | { type: "ADD_NEWSLETTER"; payload: Newsletter }
  | { type: "UPDATE_NEWSLETTER"; payload: Partial<Newsletter> & { id: string } }
  | { type: "UPDATE_PROJECT_STAGE"; payload: { id: string; stage: ProjectStage } }
  | { type: "UPDATE_SOURCE_STATUS"; payload: { id: string; status: SourceRecord["status"]; converted_project_id?: string } }
  | { type: "ADD_ACTIVITY"; payload: ActivityLogEntry }
  | { type: "ADD_COMPLIANCE_ENTRY"; payload: ComplianceLogEntry };

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case "ADD_ORGANIZATION":
      return { ...state, organizations: [action.payload, ...state.organizations] };
    case "ADD_CONTACT":
      return { ...state, contacts: [action.payload, ...state.contacts] };
    case "ADD_PROJECT":
      return { ...state, projects: [action.payload, ...state.projects] };
    case "ADD_OUTREACH":
      return { ...state, outreach: [action.payload, ...state.outreach] };
    case "ADD_OPPORTUNITY":
      return { ...state, opportunities: [action.payload, ...state.opportunities] };
    case "ADD_SOURCE_RECORD":
      return { ...state, sourceRecords: [action.payload, ...state.sourceRecords] };
    case "ADD_NEWSLETTER":
      return { ...state, newsletters: [action.payload, ...state.newsletters] };
    case "UPDATE_NEWSLETTER":
      return {
        ...state,
        newsletters: state.newsletters.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload, updated_at: new Date().toISOString() } : n
        ),
      };
    case "UPDATE_PROJECT_STAGE":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id
            ? { ...p, stage: action.payload.stage, updated_at: new Date().toISOString() }
            : p
        ),
      };
    case "UPDATE_SOURCE_STATUS":
      return {
        ...state,
        sourceRecords: state.sourceRecords.map((s) =>
          s.id === action.payload.id
            ? { ...s, status: action.payload.status, converted_project_id: action.payload.converted_project_id ?? s.converted_project_id }
            : s
        ),
      };
    case "ADD_ACTIVITY":
      return { ...state, activity: [action.payload, ...state.activity] };
    case "ADD_COMPLIANCE_ENTRY":
      return { ...state, complianceLog: [action.payload, ...state.complianceLog] };
    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================
interface DataContextValue extends DataState {
  addOrganization: (org: Organization) => void;
  addContact: (contact: Contact) => void;
  addProject: (project: Project) => void;
  addOutreach: (outreach: Outreach) => void;
  addOpportunity: (opp: Opportunity) => void;
  addSourceRecord: (source: SourceRecord) => void;
  addNewsletter: (nl: Newsletter) => void;
  updateNewsletter: (updates: Partial<Newsletter> & { id: string }) => void;
  updateProjectStage: (id: string, stage: ProjectStage) => void;
  updateSourceStatus: (id: string, status: SourceRecord["status"], convertedProjectId?: string) => void;
  getOrg: (id: string) => Organization | undefined;
  getContact: (id: string) => Contact | undefined;
  getProject: (id: string) => Project | undefined;
  getSourceRecord: (id: string) => SourceRecord | undefined;
  getNewsletter: (id: string) => Newsletter | undefined;
  getContactsForOrg: (orgId: string) => Contact[];
  getProjectsForOrg: (orgId: string) => Project[];
  getOutreachForContact: (contactId: string) => Outreach[];
  getOutreachForProject: (projectId: string) => Outreach[];
  getOpportunitiesForProject: (projectId: string) => Opportunity[];
}

const DataContext = createContext<DataContextValue | null>(null);

// ============================================================
// Provider
// ============================================================
const INITIAL_STATE: DataState = {
  organizations: MOCK_ORGANIZATIONS,
  contacts: MOCK_CONTACTS,
  projects: MOCK_PROJECTS,
  sourceRecords: MOCK_SOURCE_RECORDS,
  outreach: MOCK_OUTREACH,
  complianceLog: MOCK_COMPLIANCE_LOG,
  opportunities: MOCK_OPPORTUNITIES,
  newsletters: MOCK_NEWSLETTERS,
  activity: MOCK_ACTIVITY,
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Helpers to add an activity log entry alongside mutations
  const logActivity = useCallback((action: string, entityType: string, entityId: string, details: Record<string, unknown>) => {
    dispatch({
      type: "ADD_ACTIVITY",
      payload: {
        id: `act-${Date.now()}`,
        user_id: null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      },
    });
  }, []);

  const addOrganization = useCallback((org: Organization) => {
    dispatch({ type: "ADD_ORGANIZATION", payload: org });
    logActivity("created", "organization", org.id, { name: org.name });
  }, [logActivity]);

  const addContact = useCallback((contact: Contact) => {
    dispatch({ type: "ADD_CONTACT", payload: contact });
    logActivity("contact_added", "contact", contact.id, { name: `${contact.first_name} ${contact.last_name}` });
  }, [logActivity]);

  const addProject = useCallback((project: Project) => {
    dispatch({ type: "ADD_PROJECT", payload: project });
    logActivity("created", "project", project.id, { name: project.name });
  }, [logActivity]);

  const addOutreach = useCallback((o: Outreach) => {
    dispatch({ type: "ADD_OUTREACH", payload: o });
    logActivity("outreach_sent", "outreach", o.id, { channel: o.channel, subject: o.subject });
  }, [logActivity]);

  const addOpportunity = useCallback((opp: Opportunity) => {
    dispatch({ type: "ADD_OPPORTUNITY", payload: opp });
    logActivity("created", "opportunity", opp.id, { project_id: opp.project_id, amount: opp.amount });
  }, [logActivity]);

  const addSourceRecord = useCallback((source: SourceRecord) => {
    dispatch({ type: "ADD_SOURCE_RECORD", payload: source });
    logActivity("source_added", "source_record", source.id, { title: source.title, source_type: source.source_type });
  }, [logActivity]);

  const addNewsletter = useCallback((nl: Newsletter) => {
    dispatch({ type: "ADD_NEWSLETTER", payload: nl });
    logActivity("created", "newsletter", nl.id, { title: nl.title });
  }, [logActivity]);

  const updateNewsletter = useCallback((updates: Partial<Newsletter> & { id: string }) => {
    dispatch({ type: "UPDATE_NEWSLETTER", payload: updates });
    logActivity("updated", "newsletter", updates.id, { fields: Object.keys(updates).filter((k) => k !== "id") });
  }, [logActivity]);

  const updateProjectStage = useCallback((id: string, stage: ProjectStage) => {
    const project = state.projects.find((p) => p.id === id);
    dispatch({ type: "UPDATE_PROJECT_STAGE", payload: { id, stage } });
    logActivity("stage_changed", "project", id, { from: project?.stage, to: stage });
    // Add compliance entry for stage changes
    dispatch({
      type: "ADD_COMPLIANCE_ENTRY",
      payload: {
        id: `comp-${Date.now()}`,
        actor_id: null,
        action: "project_stage_changed",
        entity_type: "project",
        entity_id: id,
        details: { from: project?.stage, to: stage, project: project?.name },
        disclosure_text: null,
        firm_approval_required: stage === "submitted" || stage === "closing",
        firm_approved: null,
        firm_approved_by: null,
        firm_approved_at: null,
        created_at: new Date().toISOString(),
      },
    });
  }, [state.projects, logActivity]);

  const updateSourceStatus = useCallback((id: string, status: SourceRecord["status"], convertedProjectId?: string) => {
    dispatch({ type: "UPDATE_SOURCE_STATUS", payload: { id, status, converted_project_id: convertedProjectId } });
    logActivity("source_status_changed", "source_record", id, { status, converted_project_id: convertedProjectId });
  }, [logActivity]);

  // Getters
  const getOrg = useCallback((id: string) => state.organizations.find((o) => o.id === id), [state.organizations]);
  const getContact = useCallback((id: string) => state.contacts.find((c) => c.id === id), [state.contacts]);
  const getProject = useCallback((id: string) => state.projects.find((p) => p.id === id), [state.projects]);
  const getSourceRecord = useCallback((id: string) => state.sourceRecords.find((s) => s.id === id), [state.sourceRecords]);
  const getNewsletter = useCallback((id: string) => state.newsletters.find((n) => n.id === id), [state.newsletters]);
  const getContactsForOrg = useCallback((orgId: string) => state.contacts.filter((c) => c.organization_id === orgId), [state.contacts]);
  const getProjectsForOrg = useCallback((orgId: string) => state.projects.filter((p) => p.organization_id === orgId), [state.projects]);
  const getOutreachForContact = useCallback((contactId: string) => state.outreach.filter((o) => o.contact_id === contactId), [state.outreach]);
  const getOutreachForProject = useCallback((projectId: string) => state.outreach.filter((o) => o.project_id === projectId), [state.outreach]);
  const getOpportunitiesForProject = useCallback((projectId: string) => state.opportunities.filter((o) => o.project_id === projectId), [state.opportunities]);

  const value: DataContextValue = {
    ...state,
    addOrganization,
    addContact,
    addProject,
    addOutreach,
    addOpportunity,
    addSourceRecord,
    addNewsletter,
    updateNewsletter,
    updateProjectStage,
    updateSourceStatus,
    getOrg,
    getContact,
    getProject,
    getSourceRecord,
    getNewsletter,
    getContactsForOrg,
    getProjectsForOrg,
    getOutreachForContact,
    getOutreachForProject,
    getOpportunitiesForProject,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
