# Supabase schema and LLM mapping

Schema source of truth: `supabase/migrations/0001_admin_schema.sql`. Apply it with the Supabase CLI (`supabase db push`) or the SQL editor.

## Entity mapping

| Concern | Table | Notes |
|---|---|---|
| Auth | `auth.users` (managed) | Triggers mirror inserts and `last_sign_in_at` into `profiles`. |
| User | `profiles` | `role` is `user`, `admin` or `super_admin`; `status` is `active`, `suspended` or `invited`. |
| Organization | `organizations`, `organization_members` | `owner_id` is the billing owner; member roles are `owner`, `admin`, `member`. |
| Company | `companies` | Belongs to one organization (`org_id`). |
| LLM setup | `llm_configs`, `llm_usage` | See below. |

## Access control

Row level security is enabled on every table. `public.is_admin()` (security definer) gates all dashboard reads and writes; a plain user can only read their own profile. The frontend additionally refuses sessions whose profile role is `user`.

## LLM configuration

`llm_configs` binds a provider and model to a `purpose` (`chat`, `summarization`, `embedding`) at a `scope`:

- `global` — no `org_id` / `company_id`; the default for every user.
- `organization` — requires `org_id`.
- `company` — requires `company_id`.

At runtime resolve the most specific enabled row: company, then organization, then global. A check constraint keeps scope and foreign keys consistent and a unique index allows one config per scope target and purpose.

Provider API keys are never stored in these tables: `api_key_secret_id` references a Supabase Vault secret. `llm_usage` records token counts and cost per call and feeds the overview charts through `admin_overview_stats()`.

## Integrations (runtime, browser-only)

The Integrations page lets an operator connect a Supabase project and an LLM API without touching env vars:

- `src/lib/integrations.ts` persists the Supabase URL/key and LLM provider/model/API key in `localStorage` (key `teamx-admin.integrations`). Nothing is sent to any server other than the provider the key belongs to.
- `src/lib/inspect.ts` reads the project's table and column list from the PostgREST OpenAPI document at `/rest/v1/`. This needs the service-role (secret) key on current Supabase projects.
- `src/lib/llm.ts` sends a single prompt to Anthropic, OpenAI, Google or Mistral directly from the browser; `schemaPrompt` turns an inspected schema into the "Intelligence" analysis prompt.
- Without a connection, `demoSchema` and `demoInsights` in `src/lib/mock-data.ts` back the "Load demo schema" button.

These integration credentials are separate from `VITE_SUPABASE_*`, which still drive the dashboard's own data and login. Browser-held secrets are acceptable for a local operator tool only; move calls behind an Edge Function before hosting this anywhere shared.

## Data access

`src/lib/api.ts` is the only module that queries Supabase. Row shapes are in `src/lib/types.ts` and must be kept in step with the migration.
