"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/store/DataContext";
import { generateAllAlerts, type WorkflowAlert, type AlertSeverity, type AlertCategory } from "@/lib/workflow/rules";

const SEVERITY_STYLES: Record<AlertSeverity, { bg: string; border: string; dot: string; text: string }> = {
  critical: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", text: "text-red-700" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
  info: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", text: "text-blue-700" },
};

const CATEGORY_ICONS: Record<AlertCategory, string> = {
  stale_deal: "⏰",
  follow_up: "📧",
  stage_nudge: "📈",
  missing_data: "📝",
  opportunity: "💰",
  compliance: "🛡️",
};

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  stale_deal: "Stale Deals",
  follow_up: "Follow-Ups",
  stage_nudge: "Stage Suggestions",
  missing_data: "Missing Data",
  opportunity: "Opportunities",
  compliance: "Compliance",
};

export default function WorkflowPage() {
  const { projects, outreach, opportunities } = useData();

  const alerts = useMemo(
    () => generateAllAlerts(projects, outreach, opportunities),
    [projects, outreach, opportunities]
  );

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<AlertCategory, WorkflowAlert[]>();
    for (const alert of alerts) {
      const list = map.get(alert.category) ?? [];
      list.push(alert);
      map.set(alert.category, list);
    }
    return map;
  }, [alerts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Workflow Alerts</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Automated reminders, follow-ups, and deal health checks
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-red-600 font-medium">Critical</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
          <p className="text-xs text-amber-600 font-medium">Warnings</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
          <p className="text-xs text-blue-600 font-medium">Info</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-text-primary">All Clear</p>
          <p className="text-sm text-text-secondary mt-1">No workflow alerts right now. Your pipeline is healthy!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([category, categoryAlerts]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category]}</span>
                {CATEGORY_LABELS[category]}
                <span className="text-text-muted font-normal">({categoryAlerts.length})</span>
              </h2>
              <div className="space-y-2">
                {categoryAlerts.map((alert) => {
                  const styles = SEVERITY_STYLES[alert.severity];
                  return (
                    <div
                      key={alert.id}
                      className={`${styles.bg} border ${styles.border} rounded-xl p-4 flex items-start gap-3`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${styles.dot} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${styles.text}`}>{alert.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{alert.description}</p>
                      </div>
                      <Link
                        href={alert.action_href}
                        className={`text-xs font-medium ${styles.text} hover:underline px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors whitespace-nowrap flex-shrink-0`}
                      >
                        {alert.action_label} →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
