import { MOCK_PROJECTS, MOCK_ORGANIZATIONS, MOCK_CONTACTS } from "@/lib/mock-data";
import { MOCK_SOURCE_RECORDS, MOCK_OUTREACH, MOCK_COMPLIANCE_LOG, MOCK_OPPORTUNITIES, MOCK_NEWSLETTERS } from "@/lib/mock-data-extended";

export default function AdminPage() {
  const systemHealth = [
    { label: "Database", status: "Mock Data", color: "amber" },
    { label: "Auth", status: "Bypassed (dev)", color: "amber" },
    { label: "AI (Claude)", status: "Not configured", color: "slate" },
    { label: "Email (Resend)", status: "Not configured", color: "slate" },
    { label: "Build", status: "Passing", color: "green" },
  ];

  const dataCounts = [
    { label: "Organizations", count: MOCK_ORGANIZATIONS.length, icon: "🏢" },
    { label: "Contacts", count: MOCK_CONTACTS.length, icon: "👤" },
    { label: "Projects", count: MOCK_PROJECTS.length, icon: "🏗️" },
    { label: "Opportunities", count: MOCK_OPPORTUNITIES.length, icon: "💰" },
    { label: "Source Records", count: MOCK_SOURCE_RECORDS.length, icon: "📡" },
    { label: "Outreach", count: MOCK_OUTREACH.length, icon: "📧" },
    { label: "Compliance Entries", count: MOCK_COMPLIANCE_LOG.length, icon: "🛡️" },
    { label: "Newsletters", count: MOCK_NEWSLETTERS.length, icon: "📰" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Admin</h1>

      {/* System Health */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">System Health</h2>
        <div className="space-y-3">
          {systemHealth.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-text-primary">{item.label}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                item.color === "green" ? "bg-green-100 text-green-800" :
                item.color === "amber" ? "bg-amber-100 text-amber-800" :
                "bg-slate-100 text-slate-800"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Overview */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Data Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {dataCounts.map((item) => (
            <div key={item.label} className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span>{item.icon}</span>
                <span className="text-xs text-text-muted">{item.label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Configuration</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-primary">Supabase URL</span>
            <span className="text-text-muted font-mono text-xs">Not configured</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-primary">Anthropic API Key</span>
            <span className="text-text-muted font-mono text-xs">Not configured</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-primary">Resend API Key</span>
            <span className="text-text-muted font-mono text-xs">Not configured</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-text-primary">Firm Name</span>
            <span className="text-text-muted font-mono text-xs">Not set</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-text-primary">Version</span>
            <span className="text-text-primary font-mono text-xs">v0.5.0 — Sprint 5</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Setup Guide</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
            <span className="text-text-primary">Create a Supabase project and run <code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code></span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
            <span className="text-text-primary">Set environment variables in <code className="bg-surface-secondary px-1.5 py-0.5 rounded text-xs">.env.local</code></span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
            <span className="text-text-primary">Add Anthropic API key for AI scoring and extraction</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
            <span className="text-text-primary">Configure Resend for outreach email delivery</span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs flex items-center justify-center font-bold">5</span>
            <span className="text-text-primary">Deploy to Vercel and configure custom domain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
