"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { useToast } from "@/lib/store/ToastContext";
import { SECTORS } from "@/lib/config/sectors";
import Badge from "@/components/ui/Badge";
import type { NewsletterStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  draft: "slate",
  review: "amber",
  approved: "blue",
  scheduled: "violet",
  sent: "green",
};

const NEXT_STATUS: Partial<Record<NewsletterStatus, { status: NewsletterStatus; label: string }>> = {
  draft: { status: "review", label: "Submit for Review" },
  review: { status: "approved", label: "Approve" },
  approved: { status: "sent", label: "Mark as Sent" },
};

export default function NewsletterPage() {
  const { newsletters, updateNewsletter } = useData();
  const { toast } = useToast();

  const sorted = useMemo(
    () => [...newsletters].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [newsletters]
  );

  const stats = {
    total: newsletters.length,
    drafts: newsletters.filter((n) => n.status === "draft").length,
    review: newsletters.filter((n) => n.status === "review").length,
    sent: newsletters.filter((n) => n.status === "sent").length,
  };

  function handleAdvance(id: string, toStatus: NewsletterStatus) {
    const updates: Partial<typeof newsletters[0]> & { id: string } = { id, status: toStatus };
    if (toStatus === "approved") {
      updates.approved_by = "partner";
    }
    if (toStatus === "sent") {
      updates.sent_at = new Date().toISOString();
      updates.recipient_count = Math.floor(Math.random() * 100) + 50;
    }
    updateNewsletter(updates);
    toast(`Newsletter ${toStatus === "sent" ? "sent" : toStatus === "approved" ? "approved" : "submitted for review"}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Newsletter</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {stats.total} editions &middot;{" "}
            {stats.drafts > 0 && <><span className="text-text-muted">{stats.drafts} drafts</span> &middot; </>}
            {stats.review > 0 && <><span className="text-amber-600">{stats.review} in review</span> &middot; </>}
            <span className="text-green-600">{stats.sent} sent</span>
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
        {sorted.map((nl) => {
          const nextAction = NEXT_STATUS[nl.status];
          return (
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

                {/* Action buttons */}
                {nextAction && (
                  <button
                    onClick={() => handleAdvance(nl.id, nextAction.status)}
                    className="text-xs font-medium text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {nextAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            No newsletter editions yet
          </div>
        )}
      </div>
    </div>
  );
}
