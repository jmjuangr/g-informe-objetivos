# Assumptions

- PDF export keeps grouped items per instruction and includes metadata, observaciones y plazo.
- Plazo is selected per item at export time (not stored in Supabase).
- Supabase uses normalized tables (`commissions`, `instructions`, `matters`, `submatters`, `work_lines`, `items_objetivo`) and a read view `v_items_export` for UI/PDF.
- `items_objetivo.id` is a UUID primary key generated with `gen_random_uuid()` via `pgcrypto`.
