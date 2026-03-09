"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import type { Outreach, OutreachChannel, OutreachDirection, OutreachStatus } from "@/lib/types";

export default function NewOutreachPage() {
  const router = useRouter();
  const { contacts, projects, addOutreach } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const outreach: Outreach = {
      id: `out-${Date.now()}`,
      contact_id: (form.get("contact_id") as string) || null,
      project_id: (form.get("project_id") as string) || null,
      channel: (form.get("channel") as OutreachChannel) || "email",
      direction: (form.get("direction") as OutreachDirection) || "outbound",
      subject: (form.get("subject") as string) || null,
      body: (form.get("body") as string) || null,
      template_id: null,
      status: (form.get("status") as OutreachStatus) || "sent",
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
    toast("Outreach logged");
    router.push("/outreach");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/outreach" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Outreach
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Log Outreach</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-text-primary mb-1">Channel <span className="text-red-500">*</span></label>
              <select id="channel" name="channel" required className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="linkedin">LinkedIn</option>
                <option value="in_person">In Person</option>
              </select>
            </div>
            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-text-primary mb-1">Direction</label>
              <select id="direction" name="direction" className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40">
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_id" className="block text-sm font-medium text-text-primary mb-1">Contact</label>
              <select id="contact_id" name="contact_id" className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40">
                <option value="">Select contact...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-text-primary mb-1">Project</label>
              <select id="project_id" name="project_id" className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40">
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">Subject</label>
            <input id="subject" name="subject" type="text" className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40" placeholder="e.g. Capital partner opportunity follow-up" />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-text-primary mb-1">Notes / Body</label>
            <textarea id="body" name="body" rows={4} className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none" placeholder="Summary of the outreach..." />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select id="status" name="status" className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40">
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="replied">Replied</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Log Outreach"}
          </button>
          <Link href="/outreach" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
