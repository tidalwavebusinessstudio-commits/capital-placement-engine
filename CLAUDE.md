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
## Build Progress (as of 2026-03-28)
Sprint 1-11 complete. v1.0.0. 40+ routes (28 pages + 21 API). 0 build errors.
Supabase fully connected with live data (5 orgs, 5 contacts, 5 projects seeded).
All CRUD operations persist to Supabase with optimistic UI updates.

Sprint 11 (2026-03-28): Live Supabase connection, API completion, auto-scoring.
- Connected all 9 DataContext API fetches to Supabase with retry mechanism
- Added POST to /api/opportunities, /api/sources, /api/newsletters
- Added PATCH to /api/sources, /api/newsletters
- Wired all 5 previously local-only DataContext mutations to API routes
- Auto-scoring + fee calculation on project creation
- Fixed server component auth for dev bypass mode (db.ts getSupabaseClient)
- Fixed TypeScript build errors, production build passes clean

### API Routes (Complete)
- /api/organizations — GET, POST
- /api/contacts — GET, POST
- /api/projects — GET, POST (auto-scores + fees), PATCH (stage update)
- /api/outreach — GET, POST
- /api/sources — GET, POST, PATCH (status update)
- /api/sources/import — POST (CSV → projects with scoring)
- /api/sources/feeds/check — POST (RSS/Atom parser + relevance scoring)
- /api/opportunities — GET, POST
- /api/newsletters — GET, POST, PATCH
- /api/compliance — GET; /api/compliance/approve — POST
- /api/activity — GET
- /api/ai/extract — POST (Claude: parse articles → project data)
- /api/ai/outreach — POST (Claude: draft institutional emails)
- /api/ai/capital-gap — POST (Claude: analyze funding gaps)
- /api/ai/explain-score — POST (Claude: narrative score explanation)
- /api/ai/newsletter — POST (Claude: draft sector newsletters)
- /api/email/send — POST (Resend + compliance log)
- /api/projects/[id]/pdf — GET (jsPDF deal summary export)
- /api/auth/signout — POST
- /api/health — GET

### Known Issues / Patterns
- OneDrive causes .next cache corruption (symlink issues). Always rm -rf .next before dev/build
- Cold start: DataContext retries API fetches (up to 2 retries with backoff) to handle compilation delays
- DEV_BYPASS_AUTH=true skips all auth in middleware; db.ts uses server client (anon key works when RLS not enforced)
- Badge component uses label+color props (NOT children+variant)
- Launch config at .claude/launch.json (workspace root SHAREit/.claude/)

### GitHub & Deploy
- GitHub: tidalwavebusinessstudio-commits/capital-placement-engine (private)
- Vercel: vercel.json configured (region: iad1)

### What's Next
- Push Sprint 11 changes to GitHub
- Deploy to Vercel
- Set up Resend API key for live email sending
- Configure Google OAuth in Supabase Auth for production login
- Run rls-policies.sql once production auth is ready
</claude-mem-context>