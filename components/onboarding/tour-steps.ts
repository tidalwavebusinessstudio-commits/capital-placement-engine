// ============================================================
// Onboarding Tour Step Definitions
// ============================================================

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour-id="/dashboard"]',
    title: "Dashboard",
    description:
      "Your command center. See total pipeline value, funding gaps, estimated fees, and Kevin's share at a glance. Track deals by stage and sector, spot stale deals, and monitor workflow alerts.",
  },
  {
    targetSelector: '[data-tour-id="/projects"]',
    title: "Projects",
    description:
      "Browse and manage all capital placement projects. Each project is auto-scored (0-100) based on sector fit, deal size, capital gap clarity, geography, contacts, and timing. Create new projects or filter by sector and stage.",
  },
  {
    targetSelector: '[data-tour-id="/projects/pipeline"]',
    title: "Pipeline",
    description:
      "Visual Kanban board showing projects across pipeline stages — from Discovered through Closing. See deal values and scores on each card to prioritize your next moves.",
  },
  {
    targetSelector: '[data-tour-id="/organizations"]',
    title: "Organizations",
    description:
      "Manage sponsor, developer, and lender companies. Each org links to its contacts and projects so you can see the full relationship picture at a glance.",
  },
  {
    targetSelector: '[data-tour-id="/contacts"]',
    title: "Contacts",
    description:
      "Your people CRM. Track decision makers, relationship warmth (cold/warm/hot), titles, and contact info. Link contacts to organizations and projects.",
  },
  {
    targetSelector: '[data-tour-id="/opportunities"]',
    title: "Opportunities",
    description:
      "Track specific capital placement opportunities tied to projects. Record opportunity type, amount, fee potential, and status as deals progress.",
  },
  {
    targetSelector: '[data-tour-id="/outreach"]',
    title: "Outreach",
    description:
      "Log and track all communications — emails, calls, and LinkedIn messages. Use the AI drafter to compose institutional-tone outreach with compliance disclosures auto-appended.",
  },
  {
    targetSelector: '[data-tour-id="/sources"]',
    title: "Sources",
    description:
      "Your deal sourcing inbox. RSS feeds auto-discover projects, AI extracts deal data from articles, and CSV import handles bulk uploads. Use Deep Extract to analyze any URL.",
  },
  {
    targetSelector: '[data-tour-id="/newsletter"]',
    title: "Newsletter",
    description:
      "Create sector-focused newsletters for your network. AI drafts market commentary and deal highlights. Manage draft → review → send workflow.",
  },
  {
    targetSelector: '[data-tour-id="/workflow"]',
    title: "Workflow",
    description:
      "Smart alerts that surface what needs attention: stale deals, missing follow-ups, high-score projects stuck in early stages, compliance items pending approval, and more.",
  },
  {
    targetSelector: '[data-tour-id="/compliance"]',
    title: "Compliance",
    description:
      "Immutable audit trail of all securities-related activity. Stage changes, outreach, and fee agreements auto-log here. Items requiring firm approval surface at the top.",
  },
  {
    targetSelector: '[data-tour-id="/analytics"]',
    title: "Analytics",
    description:
      "Pipeline analytics: fee forecasting, sector performance, outreach conversion rates, source effectiveness, and weighted pipeline value by close probability.",
  },
  {
    targetSelector: '[data-tour-id="/admin"]',
    title: "Admin",
    description:
      "System configuration, health status, and setup guide. Access the How-To Guide here, manage API keys, and monitor database connectivity.",
  },
];
