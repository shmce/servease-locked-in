# Legacy Web-Local Database Artifacts

Last verified from repository files: 2026-05-23.

## Status

The files in this directory are legacy web-local schema artifacts from an earlier provider-registration prototype:

- `schema.sql`
- `example-queries.sql`

They are not the active ServEase migration path and should not be applied to the shared database for current development.

## Current Source Of Truth

Use `backend/database/` for active migrations. The backend owns database changes by service schema, and services access only their owned schemas. The API Gateway must not read service tables directly except for approved Supabase Storage upload workflows.

Relevant current docs:

- `../README.md`: current `servease-web/` setup and backend boundary.
- `../../backend/database/README.md`: active migration rules.
- `../../docs/data-ownership.md`: service-owned schema and table ownership.
- `../../docs/supabase-baseline.md`: observed Supabase baseline and advisor notes.

## Rules

- Do not run `servease-web/database/schema.sql` against the active Supabase project.
- Do not add new current migrations under `servease-web/database/`.
- Put new database changes in `backend/database/` and document the owning service.
- Browser code in `servease-web/` should call local Next.js API proxy routes or public gateway routes, not Supabase service-role database APIs.
