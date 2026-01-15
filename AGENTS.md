# AGENTS.md — Project Instructions for Codex

## 0) Regla de oro
Antes de escribir código:
1) Lee `PRD.md` (root) para entender QUÉ hay que construir.
2) Lee `PROJECT_STATUS.md` (root) si existe para saber el progreso.
3) Si algo no está definido en el PRD, asume lo mínimo posible y documenta la suposición en `/docs/assumptions.md`.

## 1) Contexto del proyecto (qué es)
Aplicación web para:
- **Administradores (authenticated)**: CRUD de ítems de configuración (catálogo jerárquico normalizado).
- **Usuarios públicos/anónimos (anon)**: seleccionar ítems + introducir metadatos y **generar un PDF** (100% client-side).

## 2) Tech stack (obligatorio)
- Next.js (App Router)
- TypeScript
- Supabase (DB + Auth + RLS)
- Deploy objetivo: Vercel + Supabase

UI/UX:
- shadcn/ui
- react-hook-form + zod
- lucide-react
- Toaster para feedback

## 3) Fuentes de verdad
- `PRD.md` (root): especificación de producto canónica.
- `PROJECT_STATUS.md` (root): estado y decisiones.
- Si existe `/supabase/migrations/*`: fuente canónica de schema/policies.

## 4) No negociables (muy importante)
1) **NO persistencia de informes**:
   - El PDF se genera en el cliente.
   - NO crear rutas backend/API para PDF.
2) **Acceso público**:
   - La vista principal (generador) es pública.
   - RLS debe permitir `anon` hacer `SELECT` sobre la vista `v_items_export` (o tablas de lectura necesarias).
3) **Esquema normalizado**:
   - Mantener tablas normalizadas y la vista `v_items_export` para el consumo en UI/PDF.
4) **Año fijo**:
   - El año es fijo (2026) y se guarda en `items_objetivo`.
5) **Plazo por item**:
   - El plazo se define por cada item seleccionado (no se guarda en la tabla).

## 5) Notas de implementación (seguir estrictamente)
### 5.1 PDF generation
- Implementar 100% client-side (sin rutas server).
- El PDF debe reflejar el orden y agrupacion de la UI.
- Prohibido: server routes para generar el PDF.

### 5.2 Supabase & RLS
- Tablas normalizadas + vista `v_items_export` como en PRD.
- Activar RLS.
- Policies:
  - Public Read: permitir SELECT para `anon`.
  - Admin Full: permitir ALL para `authenticated`.
- Mantener policies en SQL/migrations cuando sea posible.

### 5.3 Routing (App Router)
- `/` => pública (form metadatos + selector ítems + export PDF)
- `/login` => login admin
- `/admin/dashboard` => privada (CRUD)

## 6) Flujo de trabajo recomendado
- Cambios pequeños y verificables.
- Orden sugerido de implementación:
  1) Scaffold + shadcn + toaster
  2) Supabase client + lectura pública
  3) UI generador (inputs/filtros/selección)
  4) PDF export (client-only)
  5) Auth + guard
  6) Admin CRUD
  7) RLS + migrations hardening
- Mantener la app siempre arrancable en local.

## 7) Definition of Done (por tarea)
Una tarea está hecha solo si:
- Cumple la parte del PRD que aplique.
- Hay feedback UX (toasts/errores).
- NO se han creado rutas server para PDF.
- El proyecto arranca y es verificable.
- Docs actualizadas si cambian decisiones o supuestos.

## 8) Comandos
- Usa los scripts existentes del repo (`package.json`).
- No inventes comandos: si faltan, añádelos explícitamente y documenta en README.
