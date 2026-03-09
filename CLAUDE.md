# Capital Placement Engine — Project Bible

## What This Is
Internal platform for Kevin Pham's capital placement operation. Sources U.S. projects ($20M-$250M+) needing debt/equity capital, qualifies them, automates outreach, tracks compliance. Works under a firm/partner structure — all securities activity routes through the firm.

## Tech Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- Anthropic Claude SDK (AI scoring, extraction, drafting)
- Resend (email)
- Zod (validation)
- Deploy: Vercel

## Architecture
```
app/           → Pages (App Router with route groups)
  (auth)/      → Login page (unauthenticated)
  (app)/       → All authenticated pages (wrapped in Sidebar+Topbar layout)
  api/         → API route handlers
components/    → React components organized by feature
lib/           → Business logic
  supabase/    → DB clients (client.ts=browser, server.ts=RSC, admin.ts=service role)
  ai/          → Claude SDK wrapper + domain prompts
  scoring/     → Deterministic project scoring engine
  compliance/  → Immutable compliance logger + rules
  config/      → Sectors, stages, feature flags, constants
  types/       → All TypeScript interfaces
  utils/       → Formatters, validators, dedup
supabase/      → Schema SQL + migrations
```

## Database (10 tables)
users, organizations, contacts, projects, source_records, opportunities, outreach, newsletters, compliance_log (IMMUTABLE), activity_log

## Sector Priority Order
1. Data Centers (scoreWeight: 100)
2. Commercial Real Estate (85)
3. Hospitality (75)
4. Energy (70)
5. Infrastructure (65)
6. Manufacturing (60)
7. Technology (55)

## Pipeline Stages
discovered → qualifying → engaged → submitted → under_review → closing → closed | dead

## Business Rules
- Partner fees: 4-8%, Kevin gets 50% (2-4%)
- Preferred deals: $20M-$250M, will accept above/below
- Geography: United States only
- Capital types: debt, equity, or both
- All securities-related outreach requires firm approval
- compliance_log is append-only (trigger prevents UPDATE/DELETE)
- Disclosure text auto-appended to outreach

## Scoring Model (0-100)
- Sector priority fit: 25 pts
- Deal size fit: 20 pts
- Capital gap clarity: 15 pts
- Geographic desirability: 15 pts
- Contact quality: 15 pts
- Timing urgency: 10 pts

## Key Design Decisions
- Server Components by default, "use client" only for interactivity
- Supabase SSR pattern using @supabase/ssr (cookies-based auth)
- Middleware handles auth redirects (login ↔ app)
- No ORM — direct Supabase client queries
- JSON file NOT used for persistence (unlike lead-operator) — Postgres only

## Build Phases
- Phase 1 (MVP): Core CRM, manual intake, scoring, pipeline, outreach templates, compliance
- Phase 2: AI extraction, source monitors, outreach automation, newsletter engine
- Phase 3: Capital gap AI, advanced analytics, workflow automation, sector-specific models

## Port
Dev server runs on port 3002

## Do NOT
- Build a spam engine — institutional tone only
- Bypass firm compliance workflows
- Store secrets in code
- Use inline styles (Tailwind only)
- Add `any` types without justification


<claude-mem-context>
## Build Progress (as of 2026-03-08)
Sprint 1-10 complete. v0.9.0. 34 routes (26 pages + 8 API). 0 build errors.
Mock data mode works without env vars. Supabase-ready when credentials added.
Sprint 6: React Context, toasts, search/filter, pipeline transitions, CRUD forms.
Sprint 7: Supabase data access layer, API routes, RLS policies, seed data, auth flow, dev mode login.
Sprint 8: Claude SDK — AI source extraction (/sources/extract), outreach drafter, score explainer. 3 AI API routes.
Sprint 9: Git + GitHub repo (tidalwavebusinessstudio-commits/capital-placement-engine), Vercel config.
Sprint 10: Polish — outreach & compliance pages wired to live context, responsive mobile sidebar (AppShell), search on outreach.

### Current Route Map (25 page files — all fully built)
- /dashboard — KPIs ($645M pipeline, $14.7M fees, $7.3M Kevin share), pipeline by stage/sector, activity feed
- /projects — Table sorted by score, stage badges, sector icons
- /projects/pipeline — Kanban board (7 columns: discovered→closed), cards with score gauge + gap
- /projects/[id] — Detail: pipeline progress bar, CapitalGapBar, score breakdown (6 bars), fee estimate, contacts
- /projects/new — 3-section form (details, capital structure, timing/fees)
- /organizations — Table (5 mock orgs), /organizations/[id] — Detail with linked contacts/projects
- /organizations/new — Create form
- /contacts — Table (5 mock contacts sorted by status), /contacts/[id] — Detail with related projects
- /contacts/new — Create form with org dropdown, decision maker checkbox
- /sources — Inbox (6 mock records, relevance scores 18-92), /sources/[id] — Detail with extracted data + "Convert to Project"
- /sources/import — CSV upload with preview table + sample format
- /outreach — Tracker (5 mock entries, email/phone/linkedin), /outreach/new — Log outreach form
- /compliance — Immutable audit trail (6 entries), pending approval banner, disclosure text
- /analytics — Fee forecasting, sector bar charts, weighted pipeline, outreach performance, source stats
- /opportunities — 6 mock opportunities, $185M in play, $9.7M potential fees, status summary cards, linked to projects
- /newsletter — 3 mock editions, sector focus tags, AI-drafted indicator, editor notes, scheduled/sent dates
- /admin — System health dashboard, data overview, config status, 5-step setup guide

### API Routes (Sprint 7)
- /api/organizations — POST (create)
- /api/contacts — POST (create)
- /api/projects — POST (create), PATCH (update stage)
- /api/outreach — POST (create)
- /api/auth/signout — POST (logout)
- /api/health — GET (health check)

### Key Files
- lib/supabase/db.ts — Data access layer: all entity queries with mock fallback when Supabase not configured
- lib/store/DataContext.tsx — React Context provider: all entities, CRUD actions, getters. Wraps app layout via AppProviders
- lib/store/ToastContext.tsx — Toast notification system (success/error/info, auto-dismiss 4s)
- components/providers/AppProviders.tsx — Client wrapper combining DataProvider + ToastProvider
- components/layout/AppShell.tsx — Responsive shell: mobile sidebar slide-in + overlay, hamburger menu in Topbar
- lib/mock-data.ts — 5 orgs, 5 contacts, 5 projects, 7 activity entries + helper functions
- lib/mock-data-extended.ts — 6 source records, 5 outreach, 6 compliance log entries, 6 opportunities, 3 newsletters + helpers
- supabase/schema.sql — 10-table schema with indexes, triggers, constraints
- supabase/rls-policies.sql — RLS policies: authenticated read, placer/admin write, compliance immutable
- supabase/seed.sql — Demo data (5 orgs, 5 contacts, 5 projects with UUIDs)
- lib/scoring/projectScorer.ts — Deterministic scorer: 6 weighted factors (sector 25, size 20, gap 15, geo 15, contacts 15, timing 10)
- lib/types/index.ts — All interfaces: User, Organization, Contact, Project, ScoreBreakdown, CapitalGap, SourceRecord, Opportunity, Outreach, Newsletter, ComplianceLogEntry, ActivityLogEntry, DashboardKPIs + all enum types
- lib/config/sectors.ts — 7 sectors with priority, scoreWeight, color, icon, keywords. SECTOR_LIST export
- lib/config/stages.ts — 8 stages with order, color, closeProbability. PIPELINE_STAGES, ACTIVE_STAGES exports
- lib/config/constants.ts — Business rules: fees 4-8%, Kevin 50%, deal range $5M-$250M, DC top markets, US states
- lib/utils/format.ts — formatCurrency (abbreviated), formatCurrencyFull, formatPercent, formatDate, formatRelativeDate
- components/ui/Badge.tsx — Props: label (string), color (string), size (sm|md). NOT children/variant pattern
- components/ui/ScoreGauge.tsx, CapitalGapBar.tsx, EmptyState.tsx, StatusBadge.tsx
- supabase/schema.sql — Full 10-table schema (not yet deployed)

### Known Issues / Patterns
- OneDrive causes .next cache corruption (symlink issues). Always rm -rf .next before dev/build
- next.config.ts has outputFileTracingRoot set to __dirname to help with OneDrive
- Supabase env vars not set → middleware/server/client all have guards, fall back to mock data
- Badge component uses label+color props (NOT children+variant) — Sprint 4 files were fixed for this
- Dev server first-page compilation takes 10-15s, subsequent pages ~1-3s
- Launch config at .claude/launch.json (workspace root SHAREit/.claude/)

### GitHub & Deploy
- GitHub: tidalwavebusinessstudio-commits/capital-placement-engine (private)
- Vercel: vercel.json configured (region: iad1). Deploy via Vercel dashboard → import from GitHub
- 3 commits on master branch

### What's Next
- Connect real Supabase credentials + run schema.sql + seed.sql
- Deploy to Vercel (import from GitHub dashboard)
- Phase 2: Source monitors, outreach automation, newsletter engine
- Phase 3: Capital gap AI, advanced analytics, workflow automation
</claude-mem-context>