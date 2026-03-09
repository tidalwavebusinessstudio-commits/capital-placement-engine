# Contributing to Meridian Cap

## Setup

1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Run `npm run dev` to start the dev server at `http://localhost:3002`

## Branch Naming

- `feature/description` — New features (e.g., `feature/project-scoring`)
- `fix/description` — Bug fixes (e.g., `fix/login-redirect`)
- `docs/description` — Documentation only

## Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build` to verify no TypeScript errors
4. Create a PR against `main` with a clear description of what changed and why
5. Request review

## Code Style

- **TypeScript strict mode** — no `any` types unless absolutely necessary
- **Tailwind CSS** for all styling — no inline styles, no CSS modules
- **Server Components by default** — only add `"use client"` when you need interactivity
- **Imports** — use `@/` path alias (e.g., `import { Project } from "@/lib/types"`)

## File Organization

- Pages go in `app/(app)/[page-name]/page.tsx`
- API routes go in `app/api/[resource]/route.ts`
- Reusable components go in `components/[category]/ComponentName.tsx`
- Business logic goes in `lib/[module]/`
- Types go in `lib/types/index.ts`

## Database Changes

- Add new migrations in `supabase/migrations/`
- Never modify `schema.sql` directly after initial setup — use migrations
- Document schema changes in your PR description

## Secrets

- Never commit `.env.local` or any file containing API keys
- If you add a new env var, update `.env.example` with a placeholder
