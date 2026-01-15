# Assumptions

- CSV export uses one row per selected item, with metadata columns first and item fields after (Entidad, Gestor, Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Objetivo, Objetivo 2, Observaciones, Plazo).
- Plazo is selected per item at export time (not stored in Supabase).
- Supabase uses normalized tables (`commissions`, `instructions`, `matters`, `submatters`, `work_lines`, `items_objetivo`) and a read view `v_items_export` for UI/CSV.
- `items_objetivo.id` is a UUID primary key generated with `gen_random_uuid()` via `pgcrypto`.
