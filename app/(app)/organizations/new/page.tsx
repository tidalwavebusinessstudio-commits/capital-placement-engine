"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SECTOR_LIST } from "@/lib/config/sectors";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import type { OrgType, Sector, Organization } from "@/lib/types";

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "sponsor", label: "Sponsor" },
  { value: "developer", label: "Developer" },
  { value: "lender", label: "Lender" },
  { value: "investor", label: "Investor" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

export default function NewOrganizationPage() {
  const router = useRouter();
  const { addOrganization } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const org: Organization = {
      id: `org-${Date.now()}`,
      name: form.get("name") as string,
      type: (form.get("type") as OrgType) || "other",
      sector: (form.get("sector") as Sector) || null,
      website: (form.get("website") as string) || null,
      hq_city: (form.get("hq_city") as string) || null,
      hq_state: (form.get("hq_state") as string) || null,
      employee_count: null,
      annual_revenue_range: null,
      description: (form.get("description") as string) || null,
      linkedin_url: (form.get("linkedin_url") as string) || null,
      tags: [],
      metadata: {},
      source: (form.get("source") as string) || null,
      created_by: null,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await addOrganization(org);
    toast(`${org.name} created`);
    router.push("/organizations");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/organizations" className="text-sm text-text-muted hover:text-text-primary transition-colors">
          &larr; Organizations
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-2">Add Organization</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="e.g. Vertex Data Systems"
            />
          </div>

          {/* Type + Sector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-text-primary mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                <option value="">Select type...</option>
                {ORG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-text-primary mb-1">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              >
                <option value="">Select sector...</option>
                {SECTOR_LIST.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hq_city" className="block text-sm font-medium text-text-primary mb-1">City</label>
              <input
                id="hq_city"
                name="hq_city"
                type="text"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="e.g. Dallas"
              />
            </div>
            <div>
              <label htmlFor="hq_state" className="block text-sm font-medium text-text-primary mb-1">State</label>
              <input
                id="hq_state"
                name="hq_state"
                type="text"
                maxLength={2}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand uppercase"
                placeholder="TX"
              />
            </div>
          </div>

          {/* Website + LinkedIn */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-1">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-text-primary mb-1">LinkedIn</label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
              placeholder="Brief description of the organization..."
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
              <option value="news">News</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="conference">Conference</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Organization"}
          </button>
          <Link
            href="/organizations"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
