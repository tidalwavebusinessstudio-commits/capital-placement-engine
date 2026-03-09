import Link from "next/link";
import { MOCK_OUTREACH } from "@/lib/mock-data-extended";
import { getMockContact, getMockProject } from "@/lib/mock-data";
import Badge from "@/components/ui/Badge";

const STATUS_COLORS: Record<string, "blue" | "green" | "amber" | "slate" | "red" | "violet"> = {
  draft: "slate",
  pending_approval: "amber",
  sent: "blue",
  delivered: "blue",
  opened: "violet",
  replied: "green",
  bounced: "red",
};

const CHANNEL_ICONS: Record<string, string> = {
  email: "📧",
  linkedin: "💼",
  phone: "📞",
  in_person: "🤝",
  referral: "🔗",
};

export default function OutreachPage() {
  const outreach = [...MOCK_OUTREACH].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const stats = {
    total: outreach.length,
    sent: outreach.filter((o) => o.direction === "outbound").length,
    replied: outreach.filter((o) => o.status === "replied").length,
    opened: outreach.filter((o) => o.status === "opened").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Outreach</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {stats.total} total &middot; {stats.sent} outbound &middot; {stats.replied} replies &middot; {stats.opened} opened
          </p>
        </div>
        <Link
          href="/outreach/new"
          className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Outreach
        </Link>
      </div>

      <div className="space-y-2">
        {outreach.map((item) => {
          const contact = item.contact_id ? getMockContact(item.contact_id) : null;
          const project = item.project_id ? getMockProject(item.project_id) : null;

          return (
            <div
              key={item.id}
              className="bg-surface rounded-xl border border-border p-4 hover:border-brand/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{CHANNEL_ICONS[item.channel] ?? "📨"}</span>
                    <Badge label={item.status} color={STATUS_COLORS[item.status] ?? "slate"} size="sm" />
                    <Badge label={item.direction} color={item.direction === "inbound" ? "green" : "blue"} size="sm" />
                    {item.compliance_approved && (
                      <span className="text-xs text-green-600" title="Compliance approved">✓ Approved</span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {item.subject ?? "No subject"}
                  </h3>

                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    {contact && (
                      <Link href={`/contacts/${contact.id}`} className="hover:text-brand transition-colors">
                        {contact.first_name} {contact.last_name}
                      </Link>
                    )}
                    {project && (
                      <Link href={`/projects/${project.id}`} className="hover:text-brand transition-colors">
                        {project.name}
                      </Link>
                    )}
                    <span>
                      {item.sent_at
                        ? new Date(item.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                        : "Draft"}
                    </span>
                  </div>

                  {item.body && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{item.body}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
