# TASKS

> Objective: Implement the app described in `PRD.md`, following the rules in `AGENTS.md`.
> Work mode: small steps, always keep the app runnable.

---

## T001 — Bootstrap project (Next.js + TS + Tailwind + shadcn/ui)
**Status**: Done
**Goal**
Create a fresh Next.js App Router project with the UI foundation and baseline structure.

**Scope**
- Initialize Next.js project (App Router) with TypeScript.
- Tailwind configured and working.
- shadcn/ui installed and usable.
- Add Toaster and basic layout.
- Create routes (empty shells):
  - `/` public generator page (placeholder UI)
  - `/login` login page (placeholder UI)
  - `/admin/dashboard` protected page (placeholder UI)
- Add initial folder structure:
  - `src/lib/`
  - `src/components/`
  - `src/app/`

**Deliverables**
- App starts locally.
- Minimal UI renders on the 3 routes.
- README includes run commands.

**DoD**
- `npm run dev` works.
- No CSV backend routes created.
- No Supabase DB changes yet.

---

## T002 — Supabase client setup + public read (smoke)
**Status**: In progress (client + hook ready, env keys pending)
**Goal**
Connect the app to Supabase and prove public read works (without auth).

**Scope**
- Add env var template: `.env.example` with required Supabase keys.
- Create Supabase client setup:
  - `src/lib/supabase/client.ts`
- Implement a minimal fetch of `configuration_items` (SELECT) for `/` page.
  - Render a basic list/table of items.
- Add basic error handling + toaster feedback on failure.

**Deliverables**
- Public page reads from Supabase and displays items.

**DoD**
- Works with anon key.
- No write operations.
- Clear error UI for missing env vars.

---

## T003 — Public generator UI: header inputs + filters + selection state
**Status**: Done (UI built with mock data fallback)
**Goal**
Build the real public generator interaction (still no CSV export yet).

**Scope**
- Header inputs:
  - Entidad (text)
  - Gestor (text)
  - Plazo Estimado (dropdown)
- Item selection:
  - Multi-select via checkboxes.
  - Simple filters: by `commission` and `year`.
- Maintain selection state (selected item ids).
- Basic UX:
  - Clear selected count
  - Reset selection button

**DoD**
- User can filter and select multiple items.
- No auth needed.
- No CSV generation yet.

---

## T004 — Client-side CSV export (no backend)
**Status**: Done
**Goal**
Generate and download CSV fully client-side.

**Scope**
- Create `src/lib/csv-utils.ts` with pure functions:
  - build headers
  - build rows
  - stringify CSV
  - trigger download
- Define CSV format (based on PRD):
  - Columns: metadata (Entidad, Gestor, Plazo) + selected items columns
- Add "Exportar CSV" button on `/`
- Validate required header inputs before export (zod or simple guard)
- Toaster on success/failure

**DoD**
- CSV downloads locally in browser.
- No server routes/APIs for CSV.
- Works with multiple selected items.

---

## T005 — Admin auth (Supabase Auth) + protected routing
**Goal**
Admins can login and access the dashboard; unauthenticated users are redirected.

**Scope**
- `/login` form: email + password
- Supabase Auth sign-in
- Auth guard for `/admin/dashboard`
  - Redirect to `/login` if not authenticated
- Add logout action in admin area

**DoD**
- Unauth user cannot access `/admin/dashboard`.
- Auth user can access it reliably.
- Basic feedback and error messages.

---

## T006 — Admin dashboard CRUD for `configuration_items`
**Goal**
Admins can create/update/delete configuration items.

**Scope**
- Admin list view (table)
- Create item form (modal or separate section)
- Edit item flow
- Delete item flow (confirm)
- Validation with zod (required fields from PRD)
- Keep UI simple but consistent with shadcn/ui

**DoD**
- CRUD works end-to-end against Supabase.
- Toaster feedback for all operations.
- No accidental public write paths.

---

## T007 — Supabase schema + RLS policies (migrations)
**Goal**
Ensure DB schema and security match PRD.

**Scope**
- Create SQL for table `configuration_items` if not already created.
- Enable RLS.
- Policies:
  - Public Read: allow anon SELECT
  - Admin Full: allow authenticated ALL
- Document how to apply migrations / setup.

**DoD**
- Policies are correct and verified.
- Public can read, cannot write.
- Auth can fully manage items.

---

## T008 — Hardening + UX polish
**Goal**
Make it solid and pleasant.

**Scope**
- Empty states, loading skeletons
- Better filtering UX
- Prevent duplicates in selection if needed
- Basic accessibility checks
- Improve README with setup steps

**DoD**
- No obvious UX dead ends.
- Clear setup instructions.
