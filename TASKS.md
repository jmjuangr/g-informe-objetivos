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
**Status**: Done
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

**Status**: Done (Supabase auth + demo fallback)

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

**Status**: Done (basic CRUD wired)

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

## T007.1 — New logic for data access
Objetivo: actualizar la lógica de acceso a datos. Actualmente la app lee desde una tabla plana `configuration_items` y hace agrupaciones en el front. Debes migrar el código para leer desde un esquema normalizado en Supabase y mantener la UX: filtros en cascada + selección de items + export CSV client-side.

CONTEXTO ACTUAL (repo):
- La Home `/` es pública y usa `src/lib/supabase/queries.ts` + hook `useConfigurationItems` para cargar TODOS los registros de `configuration_items` y luego filtra/agrupa en memoria.
- Admin `/admin/dashboard` hace CRUD contra `configuration_items`.
- CSV se genera 100% en cliente (`src/lib/csv-utils.ts`) y NO se debe crear API server para generar CSV.

NUEVO ESQUEMA EN SUPABASE (normalizado):
Asume que ahora existen tablas (nombres exactos):
- `commissions` (id, name, created_at)
- `instructions` (id, commission_id, name, created_at, legacy_instruction_id optional)
- `matters` (id, instruction_id, name, created_at)
- `submatters` (id, matter_id, name, created_at)
- `work_lines` (id, code, display_name, sort_order, created_at)  // A/B/C/D
- `items_objetivo` (id, instruction_id, submatter_id, work_line_id, title, status, year, legacy_item_code, created_at, etc.)
Y además existe una VIEW para consumo “plano” en lectura (si no existe, créala en migration):
- `v_items_export` con columnas para UI/CSV (al menos):
  - item_uuid (uuid del item)
  - item_code (legacy_item_code o equivalente)
  - title (texto a mostrar como objetivo)
  - status, year
  - instruction_uuid, instruction
  - commission
  - matter, submatter
  - work_line_uuid (id), work_line_code, work_line (display_name)

REGLAS / NO NEGOCIABLES:
1) La generación CSV sigue siendo client-side (NO endpoints server).
2) La Home pública debe poder hacer SELECT con `anon` (RLS).
3) La app NO debe cargar toda la tabla de items de golpe si no es necesario.
   - Debe cargar: instrucciones -> luego líneas disponibles para esa instrucción -> luego items para instrucción+línea.
4) Mantén el comportamiento de “mock mode” cuando falten env vars de Supabase.

TAREAS CONCRETAS (hazlas en este orden):

A) Actualiza schema/migrations de Supabase en el repo
1) En `/supabase/migrations/` crea una nueva migration (NO borres la anterior) que:
   - Cree las tablas normalizadas (si no existen).
   - Cree la VIEW `v_items_export` con join completo para leer “plano”.
   - Active RLS y políticas:
     - Public read (anon SELECT) para: `commissions`, `instructions`, `matters`, `submatters`, `work_lines`, `items_objetivo` y/o al menos la view `v_items_export`.
     - Admin full (authenticated ALL) para tablas de escritura: `items_objetivo` (y dimensiones si aplica).
2) Deja `configuration_items` como legacy (no la uses en el código). No la toques si no hace falta.

B) Refactor del data layer (Supabase queries + tipos)
1) Reemplaza el modelo `ConfigurationItem*` por un modelo nuevo “UI-ready” (puedes llamarlo `ObjectiveItem`) que mantenga lo que la UI necesita:
   - id (uuid del item)
   - item_id / item_code
   - commission, instruction, matter, submatter
   - work_line (display_name) + work_line_id (uuid)
   - status, year
   - item_objective y item_objective_2:
     - `item_objective` debe mapear a `title` de DB (o equivalente).
     - Si no hay `item_objective_2` en el nuevo esquema, usa `""` o null (pero mantén el campo para el CSV).
2) En `src/lib/supabase/queries.ts`:
   - Elimina/abandona las funciones que apuntan a `.from("configuration_items")`.
   - Crea nuevas funciones:
     - `fetchInstructions()` -> lee de `instructions` (idealmente con comisión para etiqueta) OR desde `v_items_export` agregando en front.
     - `fetchWorkLinesForInstruction(instructionId)` -> devuelve lista de work lines existentes para esa instrucción (y ordenadas por sort_order).
     - `fetchItemsForInstructionAndWorkLine(instructionId, workLineId)` -> devuelve items (filtra status != 'ELIMINAR' si aplica).
   - Recomiendo consultar la VIEW `v_items_export` para simplificar joins y tipado:
     - `supabase.from("v_items_export").select("*")...`
3) Crea/actualiza tipos en `src/lib/supabase/types.ts` para:
   - `InstructionOption` (id,label, maybe commission)
   - `WorkLineOption` (id,label, code, sort_order)
   - `ObjectiveItem` (lo que UI + CSV necesitan)
   - Tipos “Record” si te ayudan para normalizar.

C) Actualiza hooks y Home `/`
1) Sustituye `useConfigurationItems` por hooks en cascada:
   - `useInstructions()`
   - `useWorkLines(instructionId)`
   - `useObjectiveItems(instructionId, workLineId)`
2) Refactoriza `src/app/page.tsx`:
   - Ya NO debe construir `instructionOptions`/`workLineOptions` recorriendo todos los items.
   - Debe usar los hooks:
     - Al seleccionar instrucción, resetea work line y selección de items si procede.
     - Al seleccionar work line, carga items de esa combinación.
   - Mantén selección múltiple, “Agregar visibles”, “Limpiar selección” y la tabla de seleccionados.
   - Mantén export CSV igual (client-side) adaptando los campos:
     - Donde antes usabas `item.item_objective`, ahora usa `item.item_objective` (mapeado desde title).
     - `item.item_id` debe ser el código (legacy_item_code).
3) Mantén mockItems si no hay env vars (no rompas demo mode).

D) Actualiza Admin `/admin/dashboard`
Mínimo imprescindible para que no reviente:
1) Sustituye el CRUD contra `configuration_items` por CRUD contra `items_objetivo`.
2) Para crear/editar items:
   - Añade selects dependientes:
     - Comisión -> Instrucción -> Materia -> Submateria -> Línea (A/B/C/D) -> Item
   - Si quieres simplificar:
     - En admin puedes pedir directamente `instruction_id`, `submatter_id`, `work_line_id` (con selects cargados desde tablas).
3) Listado en admin:
   - Puede leer desde `v_items_export` (para mostrar campos planos).
   - Para editar/guardar, usa `items_objetivo`.
4) Respeta la sesión Supabase auth como ahora.

E) Limpieza, consistencia y docs
1) Busca en el repo todas las referencias a `"configuration_items"` y sustitúyelas por el nuevo approach.
2) Actualiza `AGENTS.md` y `PRD.md` solo en lo que sea estrictamente necesario:
   - Ya NO es “DB plana” como no negociable.
   - Mantén: CSV client-side, acceso público read, etc.
3) Asegura que el proyecto compila (`npm run build`) y que la Home funciona:
   - Carga instrucciones
   - Carga líneas para una instrucción
   - Lista items para instrucción+línea
   - Permite seleccionar y exportar CSV.

CRITERIOS DE ACEPTACIÓN
- Home ya no depende de `configuration_items`.
- No hay errores TS.
- No hay endpoint server para CSV.
- Filtros en cascada funcionan consumiendo Supabase en 3 pasos (instrucción -> línea -> items).
- Admin no peta y puede al menos listar y modificar items (mínimo).

IMPORTANTE: Antes de tocar código, inspecciona estos archivos para entender la implementación actual:
- `src/lib/supabase/queries.ts`
- `src/lib/supabase/types.ts`
- `src/hooks/use-configuration-items.ts`
- `src/app/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `supabase/migrations/20250309000000_create_configuration_items.sql`

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
