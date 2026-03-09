import Link from "next/link";
import { notFound } from "next/navigation";
import { getMockContact, getMockOrg, getMockProjectsForOrg } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils/format";
import Badge from "@/components/ui/Badge";

const REL_COLORS: Record<string, string> = {
  cold: "slate", warm: "amber", hot: "red", active: "green", inactive: "slate",
};

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = getMockContact(id);
  if (!contact) notFound();

  const org = contact.organization_id ? getMockOrg(contact.organization_id) : null;
  const relatedProjects = org ? getMockProjectsForOrg(org.id) : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link href="/contacts" className="text-sm text-text-muted hover:text-brand-600 transition-colors">
          &larr; Contacts
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-text-primary">
            {contact.first_name} {contact.last_name}
          </h1>
          <Badge label={contact.relationship_status} color={REL_COLORS[contact.relationship_status] ?? "slate"} size="md" />
          {contact.is_decision_maker && (
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Decision Maker</span>
          )}
        </div>
        {contact.title && (
          <p className="text-sm text-text-secondary mt-1">{contact.title}</p>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard label="Email" value={contact.email ?? "—"} isEmail={!!contact.email} />
        <InfoCard label="Phone" value={contact.phone ?? "—"} />
        <InfoCard label="Organization" value={org?.name ?? "—"} href={org ? `/organizations/${org.id}` : undefined} />
        {contact.linkedin_url && <InfoCard label="LinkedIn" value="View Profile" href={contact.linkedin_url} external />}
        <InfoCard label="Source" value={contact.source ?? "—"} />
        <InfoCard label="Added" value={formatDate(contact.created_at)} />
      </div>

      {/* Notes */}
      {contact.notes && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Notes</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{contact.notes}</p>
        </div>
      )}

      {/* Related Projects (via org) */}
      {relatedProjects.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Related Projects ({relatedProjects.length})
          </h2>
          <div className="space-y-2">
            {relatedProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <Link href={`/projects/${p.id}`} className="text-text-primary hover:text-brand-600 font-medium transition-colors">
                  {p.name}
                </Link>
                <span className="text-text-muted">{p.stage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-muted">Tags:</span>
          {contact.tags.map((tag) => (
            <span key={tag} className="text-xs bg-surface-tertiary text-text-secondary px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label, value, href, isEmail, external,
}: {
  label: string; value: string; href?: string; isEmail?: boolean; external?: boolean;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      {href ? (
        <Link href={href} className="text-sm text-brand-600 hover:underline" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {value}
        </Link>
      ) : isEmail ? (
        <a href={`mailto:${value}`} className="text-sm text-brand-600 hover:underline">{value}</a>
      ) : (
        <p className="text-sm font-medium text-text-primary">{value}</p>
      )}
    </div>
  );
}
