# Green Silicon Valley Platform — Build Plan

This document describes the architecture and high-level plan to rebuild core modules if needed.

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (database, auth, storage)
- AI: OpenRouter (API) or local Ollama (configurable)
- Deployment: Vercel

## App Structure
- `app/` — routes, layouts, pages (public site + dashboards + API routes)
- `components/` — UI components (NavBar, Footer, cards, charts, map)
- `lib/` — clients and service modules (supabase, ai, email, operations)
- `supabase/` — SQL migrations and seed
- `public/` — assets (logo, icons)

## Core Modules
1. Authentication
   - Supabase auth helpers for SSR/Edge
   - `middleware.ts` to gate `/dashboard/*` + admin routes
2. Authorization
   - Role field on `users` table: founder, intern, volunteer, teacher
   - Route-level checks and component guards
3. Public Pages
   - Home, About, Impact (map + counters), Get Involved, Contact, Login
4. Internal Dashboards
   - Founder, Intern, Volunteer with role-based widgets and actions
5. Data + APIs
   - REST-like API routes under `app/api/*` for forms and automations
   - Supabase schema SQL with FKs and seed data
6. File Storage
   - Supabase Storage for PDFs, images, slips; drag-and-drop uploader
7. AI
   - Knowledge assistant chat (DB + Storage aware)
   - Operations assistant (cron endpoint; Vercel scheduled triggers)
8. Settings
   - Automations schedule and AI provider (stored in `settings` table)

## Rebuild Steps (if recovery needed)
1. Recreate Next.js scaffold (`package.json`, configs, `app/`).
2. Restore `lib/supabase/*`, `middleware.ts`.
3. Re-add `components/` (NavBar, Footer, basic UI).
4. Restore `supabase/migrations/*.sql` and run in Supabase.
5. Bring back `app/api/*` routes (forms, assistants, cron).
6. Verify `settings` feature and update schedule provider as needed.
7. Run `npm install`, `npm run build`, address compile errors.
8. Deploy to Vercel and configure cron triggers for operations endpoint.


