import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrganization, getContactsForOrg, getProjectsForOrg } from "@/lib/supabase/db";
import { getSectorConfig } from "@/lib/config/sectors";
import { getStageConfig } from "@/lib/config/stages";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";
import ScoreGauge from "@/components/ui/ScoreGauge";
import type { Sector } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  sponsor: "violet", developer: "blue", lender: "green",
  investor: "amber", government: "slate", other: "slate",
};

const REL_COLORS: Record<string, string> = {
  cold: "slate", warm: "amber", hot: "red", active: "green", inactive: "slate",
};

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganization(id);
  if (!org) notFound();

  const contacts = await getContactsForOrg(org.id);
  const projects = await getProjectsForOrg(org.id);
  const sectorCfg = org.sector ? getSectorConfig(org.sector as Sector) : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link href="/organizations" className="text-sm text-text-muted hover:text-brand-600 transition-colors">
          &larr; Organizations
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-text-primary">{org.name}</h1>
          <Badge label={org.type} color={TYPE_COLORS[org.type] ?? "slate"} size="md" />
        </div>
        {org.description && (
          <p className="text-sm text-text-secondary mt-2 max-w-2xl">{org.description}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DetailCard label="Sector" value={sectorCfg ? `${sectorCfg.icon} ${sectorCfg.label}` : "—"} />
        <DetailCard label="Location" value={org.hq_city && org.hq_state ? `${org.hq_city}, ${org.hq_state}` : "—"} />
        <DetailCard label="Website" value={org.website ?? "—"} isLink={!!org.website} />
        <DetailCard label="Employees" value={org.employee_count?.toLocaleString() ?? "—"} />
        <DetailCard label="Revenue" value={org.annual_revenue_range ?? "—"} />
        <DetailCard label="Source" value={org.source ?? "—"} />
        <DetailCard label="Added" value={formatDate(org.created_at)} />
        <DetailCard label="Updated" value={formatDate(org.updated_at)} />
        {org.linkedin_url && <DetailCard label="LinkedIn" value="View Profile" isLink href={org.linkedin_url} />}
      </div>

      {/* Contacts */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Contacts ({contacts.length})
          </h2>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-text-muted">No contacts linked to this organization.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-text-primary hover:text-brand-600 transition-colors">
                    {c.first_name} {c.last_name}
                  </Link>
                  <p className="text-xs text-text-muted">{c.title ?? "No title"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.is_decision_maker && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">DM</span>
                  )}
                  <Badge label={c.relationship_status} color={REL_COLORS[c.relationship_status] ?? "slate"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Projects ({projects.length})
          </h2>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-text-muted">No projects linked to this organization.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => {
              const stageCfg = getStageConfig(p.stage);
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/projects/${p.id}`} className="text-sm font-medium text-text-primary hover:text-brand-600 transition-colors">
                      {p.name}
                    </Link>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(p.total_project_cost)} &middot; Gap: {formatCurrency(p.funding_gap)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreGauge score={p.priority_score} />
                    <Badge label={stageCfg.label} color={stageCfg.color} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      {org.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted">Tags:</span>
          {org.tags.map((tag) => (
            <span key={tag} className="text-xs bg-surface-tertiary text-text-secondary px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailCard({
  label, value, isLink, href,
}: {
  label: string; value: string; isLink?: boolean; href?: string;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      {isLink ? (
        <a href={href ?? value} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-text-primary">{value}</p>
      )}
    </div>
  );
}
