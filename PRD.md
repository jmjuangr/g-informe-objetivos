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
  - Campos: Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Objetivo, Objetivo 2, Estado, Año.
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
- **Motor de Exportación:**
  - Generación de CSV en el cliente (Client-side).
  - Formato: 1 fila por item_objective con las columnas:
    Entidad, Gestor, Comision, Instruccion, Materia, Submateria, Linea de Trabajo, Objetivo, Objetivo 2, Estado, Ano, Plazo

## 4. Database Schema (Supabase)

### Table: `configuration_items`

Columnas tabla maestra:

id,created_at,instruction_id,item_objective,commission,instruction,matter,submatter,work_line_id,work_line,work_line_unified,item_id,item_objective_2,status,year

Relaciones

1 instruction tiene n work_lines 
1 work_line tiene n item_objectives

Notas:
- El plazo no se almacena en la tabla; se selecciona al exportar.

Ver archivo configuration_items_rows.csv en raiz del proyecto

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
