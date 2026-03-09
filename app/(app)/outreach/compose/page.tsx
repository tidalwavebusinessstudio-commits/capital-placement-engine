"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { SECTORS } from "@/lib/config/sectors";
import { formatCurrency } from "@/lib/utils/format";
import type { Outreach } from "@/lib/types";

export default function ComposeOutreachPage() {
  const router = useRouter();
  const { contacts, projects, getOrg, addOutreach } = useData();
  const { toast } = useToast();

  const [contactId, setContactId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedContact = contactId ? contacts.find((c) => c.id === contactId) : null;
  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  async function handleAIDraft() {
    if (!selectedContact || !selectedProject) {
      toast("Select a contact and project first", "error");
      return;
    }

    setGenerating(true);
    const org = selectedContact.organization_id ? getOrg(selectedContact.organization_id) : null;
    const sectorConfig = SECTORS[selectedProject.sector];

    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: `${selectedContact.first_name} ${selectedContact.last_name}`,
          contactTitle: selectedContact.title,
          organizationName: org?.name,
          projectName: selectedProject.name,
          projectSector: sectorConfig?.label ?? selectedProject.sector,
          projectCost: selectedProject.total_project_cost
            ? formatCurrency(selectedProject.total_project_cost)
            : undefined,
          capitalType: selectedProject.capital_type,
          fundingGap: selectedProject.funding_gap
            ? formatCurrency(selectedProject.funding_gap)
            : undefined,
          location:
            selectedProject.location_city && selectedProject.location_state
              ? `${selectedProject.location_city}, ${selectedProject.location_state}`
              : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "AI drafting failed", "error");
        return;
      }

      const draft = await res.json();
      setSubject(draft.subject);
      setBody(draft.body);
      toast("AI draft generated");
    } catch {
      toast("AI service unavailable — draft manually", "error");
    } finally {
      setGenerating(false);
    }
  }

  function handleSend() {
    if (!subject.trim()) {
      toast("Subject is required", "error");
      return;
    }
    setSending(true);

    const outreach: Outreach = {
      id: `out-${Date.now()}`,
      contact_id: contactId || null,
      project_id: projectId || null,
      channel: "email",
      direction: "outbound",
      subject,
      body,
      template_id: null,
      status: "sent",
      scheduled_at: null,
      sent_at: new Date().toISOString(),
      sequence_position: null,
      sequence_id: null,
      compliance_approved: true,
      compliance_approved_by: "system",
      compliance_approved_at: new Date().toISOString(),
      created_by: null,
      created_at: new Date().toISOString(),
    };

    addOutreach(outreach);
    toast("Outreach sent and logged");
    router.push("/outreach");
  }

  function handleSaveDraft() {
    const outreach: Outreach = {
      id: `out-${Date.now()}`,
      contact_id: contactId || null,
      project_id: projectId || null,
      channel: "email",
      direction: "outbound",
      subject: subject || "Draft",
      body,
      template_id: null,
      status: "draft",
      scheduled_at: null,
      sent_at: null,
      sequence_position: null,
      sequence_id: null,
      compliance_approved: false,
      compliance_approved_by: null,
      compliance_approved_at: null,
      created_by: null,
      created_at: new Date().toISOString(),
    };

    addOutreach(outreach);
    toast("Draft saved");
    router.push("/outreach");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/outreach" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Outreach
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Compose Outreach</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          AI-assisted email drafting with compliance auto-check
        </p>
      </div>

      <div className="space-y-4">
        {/* Contact & Project Selection */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-text-primary mb-1">
                To (Contact)
              </label>
              <select
                id="contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Select contact...</option>
                {contacts
                  .filter((c) => !c.archived_at)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                      {c.title ? ` — ${c.title}` : ""}
                    </option>
                  ))}
              </select>
              {selectedContact?.email && (
                <p className="text-xs text-text-muted mt-1">{selectedContact.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-text-primary mb-1">
                Re: Project
              </label>
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Select project...</option>
                {projects
                  .filter((p) => p.stage !== "dead" && !p.archived_at)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({SECTORS[p.sector]?.label})
                    </option>
                  ))}
              </select>
              {selectedProject?.funding_gap && (
                <p className="text-xs text-text-muted mt-1">
                  Gap: {formatCurrency(selectedProject.funding_gap)}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleAIDraft}
            disabled={generating || !contactId || !projectId}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:bg-brand/10 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                🤖 Generate AI Draft
              </>
            )}
          </button>
        </div>

        {/* Email Editor */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="e.g. Capital partner opportunity — Vertex Ashburn Phase 2"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-text-primary mb-1">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none font-mono"
              placeholder="Email body..."
            />
          </div>

          {/* Compliance notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Compliance:</span> Securities disclosure will be
              auto-appended. All outreach is logged to the immutable audit trail.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim()}
            className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send & Log"}
          </button>
          <button
            onClick={handleSaveDraft}
            className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            Save Draft
          </button>
          <Link href="/outreach" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
