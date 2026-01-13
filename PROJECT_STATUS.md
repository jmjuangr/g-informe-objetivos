# PROJECT_STATUS

## Summary
Web app (Next.js + Supabase) for:
- Admins (authenticated): CRUD of configuration items
- Public (anonymous): select items + fill metadata and export client-side CSV

## Current phase
- Public generator UI foundation in place (mock data), Supabase client prepared.

## Progress checklist (TASKS.md)
- [x] T001 — Bootstrap project (Next.js + TS + Tailwind + shadcn/ui)
- [ ] T002 — Supabase client setup + public read (smoke)
- [x] T003 — Public generator UI: header inputs + filters + selection state
- [ ] T004 — Client-side CSV export (no backend)
- [ ] T005 — Admin auth (Supabase Auth) + protected routing
- [ ] T006 — Admin dashboard CRUD for `configuration_items`
- [ ] T007 — Supabase schema + RLS policies (migrations)
- [ ] T008 — Hardening + UX polish

## Decisions
- CSV generation is strictly client-side (no backend route).
- Public access to generator with anon read-only policy in Supabase RLS.
- Flat table `configuration_items` for MVP.

## Open questions / assumptions
> Add any unknowns here. If Codex must assume something, it should write it to `/docs/assumptions.md`.

- CSV exact columns/order (if not specified further in PRD)
- Whether authenticated = admin (or if we need a separate admin role/claim)

## Environment setup notes
- Supabase project URL + anon key required in env
- Auth enabled for email/password
- RLS policies required for production

## Known issues
- T001 still missing `/login` and `/admin/dashboard` placeholder routes.
- T002 pending until Supabase env vars are provided.
