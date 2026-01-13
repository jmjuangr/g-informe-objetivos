# PROJECT_STATUS

## Summary
Web app (Next.js + Supabase) for:
- Admins (authenticated): CRUD of configuration items
- Public (anonymous): select items + fill metadata and export client-side CSV

## Current phase
- Public generator UI + client-side CSV export complete; Supabase client prepared.

## Progress checklist (TASKS.md)
- [x] T001 — Bootstrap project (Next.js + TS + Tailwind + shadcn/ui)
- [ ] T002 — Supabase client setup + public read (smoke)
- [x] T003 — Public generator UI: header inputs + filters + selection state
- [x] T004 — Client-side CSV export (no backend)
- [ ] T005 — Admin auth (Supabase Auth) + protected routing
- [ ] T006 — Admin dashboard CRUD for `configuration_items`
- [ ] T007 — Supabase schema + RLS policies (migrations)
- [ ] T008 — Hardening + UX polish

## Decisions
- CSV generation is strictly client-side (no backend route).
- Public access to generator with anon read-only policy in Supabase RLS.
- Flat table `configuration_items` for MVP.

## Recent updates
- CSV client-side export implemented and working.
- UI labels updated to Spanish accents (Año, Comisión, Línea, Instrucción).
- Supabase `configuration_items` recreated to match `objetivos_2026.csv` structure; RLS + policies applied; data imported.
- `.env.local` created with Supabase URL + anon key.

## Next steps
- Adapt project types/UI/CSV to the new Supabase schema:
  - Update `src/lib/supabase/types.ts`.
  - Update `src/lib/supabase/queries.ts` if needed.
  - Update `src/app/page.tsx` filters/list/selection fields.
  - Update `src/lib/csv-utils.ts` columns.
- Confirm final CSV output columns based on new schema.
- Update `/docs/assumptions.md` with final CSV column decisions.

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
