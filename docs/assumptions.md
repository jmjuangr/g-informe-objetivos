# Assumptions

- CSV export uses one row per selected item, with metadata columns first and item fields after (Entidad, Gestor, Plazo, Comisión, Instrucción, Materia, Submateria, Línea de Trabajo, Objetivo, Objetivo 2, Estado).
- Supabase `configuration_items` columns follow the provided schema (instruction_id, item_objective, commission, instruction, matter, submatter, work_line_id, work_line, work_line_unified, item_id, item_objective_2, status); the client maps `work_line_unified` over `work_line` when present.
