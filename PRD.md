# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Project Overview
Aplicación web para la gestión y generación de informes estandarizados en formato PDF.
El sistema permite a los **Administradores** configurar un catálogo de ítems jerarquizados (Comisiones, Instrucciones, Materias, etc.) y permite a **Usuarios Anónimos** generar archivos PDF seleccionando estos ítems e introduciendo metadatos de gestión (Entidad, Gestor, Plazo).

## 2. User Roles

### A. Administrador (Auth Required)
- **Acceso:** Login vía Supabase Auth (Email/Password).
- **Permisos:**
  - Crear, Leer, Actualizar y Borrar (CRUD) los Ítems de Configuración.
  - Gestionar la jerarquía de datos.

### B. Usuario General (Public/Anonymous)
- **Acceso:** Sin autenticación (Ruta pública).
- **Permisos:**
  - Visualizar (Leer) los ítems configurados.
  - Filtrar ítems por jerarquía.
  - Generar y descargar el archivo PDF final.
  - **Restricción:** No puede modificar la base de datos, solo leer para construir su archivo local.

## 3. Core Features (MVP)

### 3.1. Panel de Administración (Protected)
- **Tabla de Gestión:** Interfaz (shadcn/ui Data Table) para visualizar todos los ítems.
- **Formulario de Ítem:**
  - Campos: Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Objetivo, Estado, Año, Código heredado.
  - Validaciones: Zod (campos requeridos).

### 3.2. Generador Público de Informes
- **Entrada de Datos de Cabecera:**
  - Entidad (Texto).
  - Gestor (Texto).

- **Selector de Ítems:**
  - Seleccion en cascada: primero se selecciona instruction, de ahi derivan las work_line y de las work_line derivan los item_objective.
  - La tabla de items disponibles tiene boton "Añadir"; al añadir un item desaparece de la lista para evitar duplicados.
  - Debajo se muestra la tabla de items seleccionados con boton "Quitar".
  - Cada item_objective seleccionado debe tener un Plazo (Primer trimestre, Segundo trimestre, Tercer trimestre, Cuarto trimestre, Ano completo).
  - Los item_objective se van acumulando en el informe, para luego exportarse.
- **Borradores locales (client-side):**
  - Exportar el estado del informe a JSON local (sin persistencia en BBDD).
  - Importar un borrador JSON para continuar editando.
- **Motor de Exportación:**
  - Generación de PDF en el cliente (Client-side).
  - El PDF mantiene la agrupacion por instruccion e incluye observaciones y plazo.

## 4. Database Schema (Supabase)

### Tablas normalizadas

- `commissions` (id, name, created_at)
- `instructions` (id, commission_id, name, created_at, legacy_instruction_id optional)
- `matters` (id, instruction_id, name, created_at)
- `submatters` (id, matter_id, name, created_at)
- `work_lines` (id, code, display_name, sort_order, created_at)
- `items_objetivo` (id, instruction_id, submatter_id, work_line_id, title, status, year, legacy_item_code, created_at)

### View de lectura (plana)

- `v_items_export` con columnas para UI/PDF:
  - item_uuid, item_code, title, status, year
  - instruction_uuid, instruction, commission
  - matter, submatter
  - work_line_uuid, work_line_code, work_line

Relaciones:

1 instruction tiene n work_lines
1 work_line tiene n items_objetivo

Notas:
- El plazo no se almacena en la tabla; se selecciona al exportar.

**Row Level Security (RLS) Policies:**
1. **Enable RLS.**
2. **Policy Public Read:** `SELECT` allowed for `anon` role (true) sobre tablas de lectura y/o `v_items_export`.
3. **Policy Admin Full:** `ALL` allowed for `authenticated` users only en tablas de escritura.

## 5. Site Map & Routing

- `src/app/page.tsx` -> **Vista Pública.** Formulario de entrada (Entidad/Gestor) + Selección de Ítems + Botón "Exportar PDF".
- `src/app/login/page.tsx` -> Formulario de acceso para admins.
- `src/app/admin/dashboard/page.tsx` -> **Vista Privada.** CRUD de `items_objetivo`.

## 6. UI/UX Guidelines (shadcn/ui)

- **Input:** Formularios limpios usando `react-hook-form` + `zod`.
- **Feedback:** `Toaster` para confirmar guardado de ítems o generación de PDF.
- **Data Display:** `Table` component para el Admin Dashboard. `Card` o `Checkbox` list para la selección pública.
- **Icons:** Lucide React para acciones (Download, Edit, Trash, Plus).
