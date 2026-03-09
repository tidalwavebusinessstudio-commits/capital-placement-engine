# Meridian Cap — Capital Placement Engine

Internal platform for sourcing and qualifying U.S. capital placement opportunities ($20M–$250M+). Built for debt and equity placement across data centers, commercial real estate, hospitality, energy, infrastructure, manufacturing, and technology sectors.

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd capital-placement-engine

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in your Supabase and Anthropic keys in .env.local

# 4. Set up database
# Go to your Supabase project → SQL Editor → paste contents of supabase/schema.sql → Run

# 5. Start dev server
npm run dev
# App runs at http://localhost:3002
```

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- **Supabase** (PostgreSQL + Auth)
- **Anthropic Claude SDK** for AI scoring, extraction, drafting
- **Resend** for email (newsletters, outreach)
- **Zod** for validation

## Project Structure

```
app/           → Pages and API routes (Next.js App Router)
components/    → Reusable UI components
lib/           → Business logic, config, utilities, AI prompts
supabase/      → Database schema and migrations
docs/          → Architecture and API documentation
```

## Key Concepts

- **Projects** — The deals. Each project has a sector, financial details, capital gap, and pipeline stage.
- **Organizations** — Companies (sponsors, developers, lenders, investors).
- **Contacts** — People at organizations.
- **Opportunities** — Matching projects to capital sources.
- **Source Records** — Raw intelligence from news, filings, LinkedIn, etc.
- **Outreach** — Email, LinkedIn, phone touchpoints with compliance logging.
- **Compliance Log** — Immutable audit trail for all securities-adjacent activity.

## Environment Variables

See `.env.example` for all required variables. You need:
- Supabase project URL + anon key + service role key
- Anthropic API key
- Resend API key (for email features)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3002) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, PR process, and code style guidelines.
