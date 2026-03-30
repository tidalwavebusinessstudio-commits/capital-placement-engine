import Link from "next/link";
import RestartTourButton from "@/components/onboarding/RestartTourButton";

const GUIDE_SECTIONS = [
  {
    icon: "📊",
    title: "Dashboard",
    href: "/dashboard",
    points: [
      "See total pipeline value, funding gap, estimated fees, and your commission share",
      "Track deal counts by pipeline stage (Discovered → Closing) and sector",
      "Spot stale deals that haven't been updated and workflow alerts needing action",
      "High-priority projects (score 80+) surface at the top for quick access",
    ],
  },
  {
    icon: "🏗️",
    title: "Projects",
    href: "/projects",
    points: [
      "Browse all projects sorted by priority score — filter by sector or stage",
      "Create new projects manually or convert them from AI-extracted sources",
      "Each project auto-scores on 6 factors: sector fit, deal size, capital gap, geography, contacts, timing",
      "Project detail pages show capital structure, score breakdown, contacts, and PDF export",
    ],
  },
  {
    icon: "📋",
    title: "Pipeline",
    href: "/projects/pipeline",
    points: [
      "Visual Kanban board with columns for each pipeline stage",
      "Cards show project name, deal value, sector, and priority score",
      "Move projects between stages to track deal progression",
      "Quick overview of where all active deals stand",
    ],
  },
  {
    icon: "🏢",
    title: "Organizations",
    href: "/organizations",
    points: [
      "Manage sponsor, developer, and lender companies",
      "Each org links to its contacts and associated projects",
      "Track sector, headquarters location, and source of relationship",
      "Create orgs before adding contacts or projects for full linking",
    ],
  },
  {
    icon: "👤",
    title: "Contacts",
    href: "/contacts",
    points: [
      "Your people CRM — track decision makers and their roles",
      "Relationship warmth levels: cold, warm, hot, active",
      "Link contacts to organizations and see related projects",
      "Flag decision makers for priority outreach",
    ],
  },
  {
    icon: "💰",
    title: "Opportunities",
    href: "/opportunities",
    points: [
      "Track specific capital placement opportunities tied to projects",
      "Record opportunity type (debt, equity, mezzanine), amount, and fee potential",
      "Monitor opportunity status as deals progress through the pipeline",
      "Calculate total potential fees across all active opportunities",
    ],
  },
  {
    icon: "📧",
    title: "Outreach",
    href: "/outreach",
    points: [
      "Log all communications: emails, calls, LinkedIn messages",
      "Track direction (inbound/outbound), channel, and status",
      "AI drafter composes institutional-tone emails with your context",
      "Compliance disclosures auto-append to all outgoing communications",
    ],
  },
  {
    icon: "📡",
    title: "Sources",
    href: "/sources",
    points: [
      "Deal sourcing inbox — RSS feeds auto-discover potential projects",
      "Manage feed monitors: enable/disable feeds, check manually, or let the hourly cron run",
      "AI Extract: paste article text or give it a URL for automatic data extraction",
      "One-click \"Convert to Project\" creates a scored project from any source",
    ],
  },
  {
    icon: "📰",
    title: "Newsletter",
    href: "/newsletter",
    points: [
      "Create sector-focused newsletters for your capital network",
      "AI drafts market commentary and deal highlights based on your active pipeline",
      "Manage draft → review → scheduled → sent workflow",
      "Each newsletter tracks sector focus and edition status",
    ],
  },
  {
    icon: "🔔",
    title: "Workflow",
    href: "/workflow",
    points: [
      "Smart alerts surface what needs your attention right now",
      "Stale deals: projects not updated in X days per stage",
      "Missing follow-ups: active deals without recent outreach",
      "Stage nudges: high-scoring projects stuck in early stages, plus compliance items pending approval",
    ],
  },
  {
    icon: "🛡️",
    title: "Compliance",
    href: "/compliance",
    points: [
      "Immutable audit trail — records cannot be edited or deleted",
      "Stage changes, outreach, and fee agreements auto-log here",
      "Items requiring firm approval surface with a pending banner",
      "Approvals create new records (not edits) to preserve the audit trail",
    ],
  },
  {
    icon: "📈",
    title: "Analytics",
    href: "/analytics",
    points: [
      "Pipeline analytics: total value, weighted fees by close probability",
      "Sector performance breakdown with bar charts",
      "Outreach conversion rates and channel effectiveness",
      "Source pipeline: track which channels produce the best deals",
    ],
  },
  {
    icon: "⚙️",
    title: "Admin",
    href: "/admin",
    points: [
      "System health dashboard: database, auth, AI, and email status",
      "Data overview showing record counts across all entity types",
      "Configuration status for all integrated services",
      "Setup guide for initial deployment and API key configuration",
    ],
  },
];

export default function GuidePage() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="text-sm text-text-muted hover:text-brand transition-colors"
          >
            &larr; Admin
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mt-1">
            How-To Guide
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Learn what each part of Meridian Cap does and how to use it
          </p>
        </div>
        <RestartTourButton />
      </div>

      {/* Quick overview */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-brand mb-2">
          Quick Overview
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Meridian Cap helps you source, qualify, and place capital for U.S.
          projects ($20M-$250M+). The platform scores every deal on 6 factors,
          tracks your pipeline from discovery to close, manages compliance, and
          uses AI to extract deals from news sources and draft institutional
          outreach.
        </p>
      </div>

      {/* Feature sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GUIDE_SECTIONS.map((section) => (
          <div
            key={section.href}
            className="bg-surface rounded-xl border border-border p-5 hover:border-brand/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{section.icon}</span>
                <h3 className="text-base font-semibold text-text-primary">
                  {section.title}
                </h3>
              </div>
              <Link
                href={section.href}
                className="text-xs text-brand hover:text-brand-hover font-medium transition-colors"
              >
                Open &rarr;
              </Link>
            </div>
            <ul className="space-y-1.5">
              {section.points.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="text-brand/50 mt-1 flex-shrink-0">
                    &bull;
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom tip */}
      <div className="mt-8 text-center">
        <p className="text-xs text-text-muted">
          Tip: Click{" "}
          <span className="font-medium text-text-secondary">
            Restart Interactive Tour
          </span>{" "}
          above to walk through each feature with guided tooltips.
        </p>
      </div>
    </div>
  );
}
