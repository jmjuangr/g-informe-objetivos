# PROJECT_STATUS

## Summary
Web app (Next.js + Supabase) for:
- Admins (authenticated): CRUD of normalized configuration items
- Public (anonymous): select items + fill metadata and export client-side CSV

## Current phase
- Public generator UI updated for cascaded selection and per-item deadline; admin auth + CRUD wired.

## Progress checklist (TASKS.md)
- [x] T001 — Bootstrap project (Next.js + TS + Tailwind + shadcn/ui)
- [x] T002 — Supabase client setup + public read (smoke)
- [x] T003 — Public generator UI: header inputs + filters + selection state
- [x] T004 — Client-side CSV export (no backend)
- [x] T005 — Admin auth (Supabase Auth) + protected routing
- [x] T006 — Admin dashboard CRUD for `items_objetivo`
- [x] T007 — Supabase schema + RLS policies (migrations)
- [ ] T008 — Hardening + UX polish

## Decisions
- CSV generation is strictly client-side (no backend route).
- Public access to generator with anon read-only policy in Supabase RLS.
- Normalized schema with `v_items_export` for UI/CSV reads.

## Recent updates
- CSV client-side export aligned to 1-row-per-item output with per-item deadline.
- Public UI now supports cascaded selection (instruction -> work_line -> item_objective) plus filter mode.
- Selected items move to a separate table with removal and per-item deadline selection.
- Admin login, route guard, logout, and CRUD for items implemented (demo fallback when no env vars).
- Supabase migration created for normalized schema + view + RLS policies and UUID default via pgcrypto.

## Next steps
- Add migrations/SQL for year column and RLS policies.
- Hardening: validations, empty states, and error messaging polish.

## Open questions / assumptions
> Add any unknowns here. If Codex must assume something, it should write it to `/docs/assumptions.md`.

- Whether authenticated = admin (or if we need a separate admin role/claim)

## Environment setup notes
- Supabase project URL + anon key required in env
- Auth enabled for email/password
- RLS policies required for production

## Known issues
- T001 still missing `/login` and `/admin/dashboard` placeholder routes.
- T002 pending until Supabase env vars are provided.
