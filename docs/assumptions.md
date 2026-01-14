# Assumptions

- CSV export uses one row per selected item, with metadata columns first and item fields after (Entidad, Gestor, Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Objetivo, Objetivo 2, Estado, Año, Plazo).
- Plazo is selected per item at export time (not stored in Supabase).
- Supabase `configuration_items` columns follow the provided schema (instruction_id, item_objective, commission, instruction, matter, submatter, work_line_id, work_line, work_line_unified, item_id, item_objective_2, status, year); the client maps `work_line_unified` over `work_line` when present and defaults missing year to 2026.
