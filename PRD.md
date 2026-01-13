# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Project Overview
Aplicación web para la gestión y generación de informes estandarizados en formato CSV.
El sistema permite a los **Administradores** configurar un catálogo de ítems jerarquizados (Comisiones, Instrucciones, Materias, etc.) y permite a **Usuarios Anónimos** generar archivos CSV seleccionando estos ítems e introduciendo metadatos de gestión (Entidad, Gestor, Plazo).

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
  - Generar y descargar el archivo CSV final.
  - **Restricción:** No puede modificar la base de datos, solo leer para construir su archivo local.

## 3. Core Features (MVP)

### 3.1. Panel de Administración (Protected)
- **Tabla de Gestión:** Interfaz (shadcn/ui Data Table) para visualizar todos los ítems.
- **Formulario de Ítem:**
  - Campos: Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Año.
  - Validaciones: Zod (campos requeridos).

### 3.2. Generador Público de Informes
- **Entrada de Datos de Cabecera:**
  - Entidad (Texto).
  - Gestor (Texto).
  - Plazo Estimado (Selector/Dropdown).
- **Selector de Ítems:**
  - Interfaz de selección múltiple (Checkbox) de los ítems configurados por el admin.
  - Filtros simples para encontrar ítems (por Comisión o Año).
- **Motor de Exportación:**
  - Generación de CSV en el cliente (Client-side).
  - Formato: Columnas de metadatos + Columnas de ítems seleccionados.

## 4. Database Schema (Supabase)

### Table: `configuration_items`
Tabla maestra desnormalizada (sin relaciones estrictas para facilitar MVP).

| Column Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | uuid | PK, default gen | Identificador único |
| `created_at` | timestamptz | default now() | Fecha de creación |
| `commission` | text | NOT NULL | Nivel 1: Comisión |
| `instruction` | text | NOT NULL | Nivel 2: Instrucción |
| `matter` | text | NOT NULL | Nivel 3: Materia |
| `submatter` | text | NOT NULL | Nivel 4: Submateria |
| `work_line` | text | NULL | Línea de trabajo asociada |
| `year` | integer | NOT NULL | Año de vigencia |

**Row Level Security (RLS) Policies:**
1. **Enable RLS.**
2. **Policy Public Read:** `SELECT` allowed for `anon` role (true).
3. **Policy Admin Full:** `ALL` allowed for `authenticated` users only.

## 5. Site Map & Routing

- `src/app/page.tsx` -> **Vista Pública.** Formulario de entrada (Entidad/Gestor) + Selección de Ítems + Botón "Exportar CSV".
- `src/app/login/page.tsx` -> Formulario de acceso para admins.
- `src/app/admin/dashboard/page.tsx` -> **Vista Privada.** CRUD de `configuration_items`.

## 6. UI/UX Guidelines (shadcn/ui)

- **Input:** Formularios limpios usando `react-hook-form` + `zod`.
- **Feedback:** `Toaster` para confirmar guardado de ítems o generación de CSV.
- **Data Display:** `Table` component para el Admin Dashboard. `Card` o `Checkbox` list para la selección pública.
- **Icons:** Lucide React para acciones (Download, Edit, Trash, Plus).
