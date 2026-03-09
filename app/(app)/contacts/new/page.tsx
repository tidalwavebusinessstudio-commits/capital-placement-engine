"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import type { RelationshipStatus, Contact } from "@/lib/types";

const STATUSES: { value: RelationshipStatus; label: string }[] = [
  { value: "cold", label: "Cold" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
  { value: "active", label: "Active" },
];

export default function NewContactPage() {
  const router = useRouter();
  const { organizations, addContact } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const contact: Contact = {
      id: `con-${Date.now()}`,
      first_name: form.get("first_name") as string,
      last_name: form.get("last_name") as string,
      title: (form.get("title") as string) || null,
      organization_id: (form.get("organization_id") as string) || null,
      email: (form.get("email") as string) || null,
      phone: (form.get("phone") as string) || null,
      linkedin_url: (form.get("linkedin_url") as string) || null,
      is_decision_maker: form.get("is_decision_maker") === "true",
      relationship_status: (form.get("relationship_status") as RelationshipStatus) || "cold",
      notes: (form.get("notes") as string) || null,
      tags: [],
      source: (form.get("source") as string) || null,
      created_by: null,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addContact(contact);
    toast(`${contact.first_name} ${contact.last_name} added`);
    router.push("/contacts");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/contacts" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Contacts
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Add Contact</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-text-primary mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-text-primary mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
          </div>

          {/* Title + Organization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="e.g. VP of Development"
              />
            </div>
            <div>
              <label htmlFor="organization_id" className="block text-sm font-medium text-text-primary mb-1">Organization</label>
              <select
                id="organization_id"
                name="organization_id"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                <option value="">Select organization...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
            </div>
          </div>

          {/* Status + Decision Maker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="relationship_status" className="block text-sm font-medium text-text-primary mb-1">
                Relationship Status
              </label>
              <select
                id="relationship_status"
                name="relationship_status"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_decision_maker"
                  value="true"
                  className="w-4 h-4 rounded border-border text-brand focus:ring-brand/40"
                />
                <span className="text-sm text-text-primary">Decision Maker</span>
              </label>
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium text-text-primary mb-1">LinkedIn</label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
            />
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-text-primary mb-1">Source</label>
            <select
              id="source"
              name="source"
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="">Select source...</option>
              <option value="referral">Referral</option>
              <option value="linkedin">LinkedIn</option>
              <option value="conference">Conference</option>
              <option value="news">News</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Contact"}
          </button>
          <Link href="/contacts" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
