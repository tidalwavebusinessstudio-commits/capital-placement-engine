"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import Badge from "@/components/ui/Badge";

const REL_COLORS: Record<string, string> = {
  cold: "slate",
  warm: "amber",
  hot: "red",
  active: "green",
  inactive: "slate",
};

export default function ContactsPage() {
  const { contacts, getOrg } = useData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = contacts.filter((c) => !c.archived_at);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const org = c.organization_id ? getOrg(c.organization_id) : null;
        return (
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          org?.name.toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => {
      const order: Record<string, number> = { hot: 0, active: 1, warm: 2, cold: 3, inactive: 4 };
      return (order[a.relationship_status] ?? 5) - (order[b.relationship_status] ?? 5);
    });
  }, [contacts, search, getOrg]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contacts</h1>
          <p className="text-sm text-text-secondary mt-1">
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          + Add Contact
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full max-w-xs px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Organization</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary">DM</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const org = c.organization_id ? getOrg(c.organization_id) : null;
                return (
                  <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface-tertiary transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/contacts/${c.id}`} className="font-medium text-text-primary hover:text-brand-600 transition-colors">
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.title ?? "—"}</td>
                    <td className="px-4 py-3">
                      {org ? (
                        <Link href={`/organizations/${org.id}`} className="text-text-secondary hover:text-brand-600 transition-colors">
                          {org.name}
                        </Link>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={c.relationship_status} color={REL_COLORS[c.relationship_status] ?? "slate"} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {c.is_decision_maker ? (
                        <span className="text-green-600 font-medium text-xs">Yes</span>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No contacts match your search
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
