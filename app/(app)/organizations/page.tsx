"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { getSectorLabel } from "@/lib/config/sectors";
import type { Sector } from "@/lib/types";

export default function OrganizationsPage() {
  const { organizations } = useData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return organizations;
    const q = search.toLowerCase();
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(q) ||
      org.type.toLowerCase().includes(q) ||
      org.hq_city?.toLowerCase().includes(q) ||
      org.hq_state?.toLowerCase().includes(q) ||
      org.sector?.toLowerCase().includes(q)
    );
  }, [organizations, search]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">Organizations</h1>
          <span className="text-xs font-medium bg-brand/10 text-brand px-2.5 py-1 rounded-full">
            {filtered.length}
          </span>
        </div>
        <Link
          href="/organizations/new"
          className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Organization
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organizations..."
          className="w-full max-w-xs px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Sector</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Website</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} className="border-b border-border last:border-b-0 hover:bg-surface-tertiary transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/organizations/${org.id}`} className="font-medium text-text-primary hover:text-brand transition-colors">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center text-xs font-medium bg-surface-secondary text-text-secondary px-2 py-0.5 rounded-full capitalize">
                      {org.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {org.sector ? getSectorLabel(org.sector as Sector) : "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {org.hq_city && org.hq_state ? `${org.hq_city}, ${org.hq_state}` : org.hq_city || org.hq_state || "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    {org.website ? (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline text-sm">
                        {org.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-text-secondary">{"\u2014"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{org.source || "\u2014"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No organizations match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
