import { MOCK_COMPLIANCE_LOG } from "@/lib/mock-data-extended";
import Badge from "@/components/ui/Badge";

const ACTION_LABELS: Record<string, string> = {
  outreach_sent: "Outreach Sent",
  project_stage_changed: "Stage Changed",
  project_submitted: "Project Submitted",
  fee_agreement_drafted: "Fee Agreement",
};

const ACTION_COLORS: Record<string, "blue" | "green" | "amber" | "slate" | "violet" | "red"> = {
  outreach_sent: "blue",
  project_stage_changed: "slate",
  project_submitted: "violet",
  fee_agreement_drafted: "amber",
};

export default function CompliancePage() {
  const logs = [...MOCK_COMPLIANCE_LOG].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const pendingApproval = logs.filter((l) => l.firm_approval_required && !l.firm_approved);
  const approved = logs.filter((l) => l.firm_approval_required && l.firm_approved);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Compliance Log</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {logs.length} entries &middot;{" "}
          <span className="text-amber-600">{pendingApproval.length} pending approval</span> &middot;{" "}
          <span className="text-green-600">{approved.length} approved</span>
        </p>
      </div>

      {/* Pending Approvals Banner */}
      {pendingApproval.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">
            ⚠️ Pending Firm Approval ({pendingApproval.length})
          </h2>
          {pendingApproval.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </p>
                <p className="text-xs text-amber-700">
                  {entry.details.project as string} — {entry.disclosure_text?.slice(0, 80)}...
                </p>
              </div>
              <button className="text-xs bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors">
                Review
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Immutable Audit Trail */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-secondary">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Audit Trail</span>
            <span className="text-xs text-text-muted">(immutable — records cannot be modified or deleted)</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {logs.map((entry) => (
            <div key={entry.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={ACTION_LABELS[entry.action] ?? entry.action} color={ACTION_COLORS[entry.action] ?? "slate"} size="sm" />
                    {entry.firm_approval_required && (
                      entry.firm_approved ? (
                        <Badge label="✓ Firm Approved" color="green" size="sm" />
                      ) : (
                        <Badge label="⏳ Pending Approval" color="amber" size="sm" />
                      )
                    )}
                  </div>

                  <div className="text-xs text-text-muted space-y-0.5 mt-1">
                    {Object.entries(entry.details).map(([key, val]) => (
                      <span key={key} className="mr-3">
                        <span className="text-text-secondary capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                        {String(val)}
                      </span>
                    ))}
                  </div>

                  {entry.disclosure_text && (
                    <p className="text-xs text-text-muted mt-1.5 italic">
                      {entry.disclosure_text}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-text-muted whitespace-nowrap">
                  <p>{new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  <p>{new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  {entry.firm_approved_at && (
                    <p className="text-green-600 mt-1">
                      Approved {new Date(entry.firm_approved_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
