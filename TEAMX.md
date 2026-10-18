# TeamX admin architecture

This file is the repository-controlled architecture index for local agents and TeamX Intelligence. Keep it short. Put durable subsystem detail in the linked Markdown documents and update the relevant document in the same change as its mapped source.

## Architecture map

| Area | Source paths | Authoritative document |
|---|---|---|
| Dashboard UI | `src/App.tsx`, `src/components/`, `src/pages/`, `src/lib/pages.tsx`, `src/index.css` | [Dashboard UI](docs/architecture/dashboard-ui.md) |
| Supabase schema and data access | `supabase/migrations/`, `src/lib/api.ts`, `src/lib/auth.tsx`, `src/lib/supabase.ts`, `src/lib/types.ts`, `src/lib/mock-data.ts`, `src/lib/integrations.ts`, `src/lib/inspect.ts`, `src/lib/llm.ts` | [Supabase schema and LLM mapping](docs/architecture/supabase-schema.md) |

## Contract

- The heading must remain `## Architecture map`.
- Each table row declares an area, one or more repository-relative source paths in backticks, and one repository-local Markdown link.
- Source paths may name a file or directory. A directory owns all descendants.
- Linked documents may reference additional repository-local Markdown files; TeamX follows those links into a bounded reference graph.
- Do not place credentials, customer data, generated logs, or transient task status in this graph.
