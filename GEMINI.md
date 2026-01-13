# PROJECT CONTEXT

## 1. Specific Configuration
This project follows the Global Tech Stack (Next.js + Supabase) defined in the global guidelines.

## 2. Intelligence Sources
To understand WHAT we are building, cross-reference:
1.  **`PRD.md` (Root):** Contains the specific features, database schema, and roles for THIS application.
2.  **`PROJECT_STATUS.md` (Root):** Tracks current progress.

## 3. Project Specifics
- **Platform:** Web (Next.js App Router).
- **Environment:** Production on Vercel / Supabase.
- **Key Deviation:**
    - **No Persistence for Reports:** Reports are generated client-side (CSV) and not stored in the DB.
    - **Public Access:** The main feature (Generation) is accessible to the `anon` role within Supabase RLS policies.

## 4. Technical Implementation Notes
- **CSV Generation:** Use a utility function (e.g., `papaparse` or native JS string construction) in `src/lib/csv-utils.ts`. DO NOT use a backend route for this; keep it client-side for speed.
- **Database:** Flat structure for `configuration_items` to allow flexibility.