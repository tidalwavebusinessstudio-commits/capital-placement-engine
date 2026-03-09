import Link from "next/link";
import { MOCK_NEWSLETTERS } from "@/lib/mock-data-extended";
import { SECTORS } from "@/lib/config/sectors";
import Badge from "@/components/ui/Badge";

const STATUS_COLORS: Record<string, string> = {
  draft: "slate",
  review: "amber",
  approved: "blue",
  scheduled: "violet",
  sent: "green",
};

export default function NewsletterPage() {
  const newsletters = [...MOCK_NEWSLETTERS].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Newsletter</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {newsletters.length} editions &middot; Sector-focused capital placement updates
          </p>
        </div>
        <Link
          href="/newsletter/new"
          className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Edition
        </Link>
      </div>

      <div className="space-y-3">
        {newsletters.map((nl) => (
          <div
            key={nl.id}
            className="bg-surface rounded-xl border border-border p-5 hover:border-brand/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge label={nl.status} color={STATUS_COLORS[nl.status] ?? "slate"} size="sm" />
                  {nl.sector_focus.map((sec) => {
                    const config = SECTORS[sec];
                    return config ? (
                      <span key={sec} className="text-xs text-text-secondary">
                        {config.icon} {config.label}
                      </span>
                    ) : null;
                  })}
                </div>

                <h3 className="text-base font-semibold text-text-primary">{nl.title}</h3>
                {nl.subject_line && (
                  <p className="text-sm text-text-secondary mt-0.5">
                    Subject: {nl.subject_line}
                  </p>
                )}

                {nl.body_text && (
                  <p className="text-xs text-text-muted mt-2 line-clamp-2">{nl.body_text}</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                  {nl.sent_at && (
                    <span className="text-green-600">
                      Sent {new Date(nl.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  {nl.scheduled_at && !nl.sent_at && (
                    <span className="text-violet-600">
                      Scheduled: {new Date(nl.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {nl.recipient_count > 0 && (
                    <span>{nl.recipient_count} recipients</span>
                  )}
                  {nl.approved_by && (
                    <span className="text-green-600">Approved by {nl.approved_by}</span>
                  )}
                  {nl.ai_draft && Object.keys(nl.ai_draft).length > 0 && (
                    <span className="text-brand">AI-drafted</span>
                  )}
                </div>

                {nl.editor_notes && (
                  <div className="mt-2 bg-surface-secondary rounded-lg px-3 py-2">
                    <p className="text-xs text-text-muted">
                      <span className="font-medium text-text-secondary">Notes:</span> {nl.editor_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
