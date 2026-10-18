# Dashboard UI

React 19 + Vite + TypeScript, styled with Tailwind CSS v4 and shadcn/ui (new-york style, neutral base). Design tokens live as CSS variables in `src/index.css`; light and dark palettes share the same names.

## Structure

- `src/components/ui/` — shadcn primitives (button, card, badge, input, label, switch, select, separator, avatar, table, skeleton, dropdown-menu). Add new ones with `npx shadcn@latest add <name>`; `components.json` is configured for the `@/` alias.
- `src/components/app-layout.tsx` — authenticated shell: sidebar, header with a page-switcher dropdown and a user dropdown, routed `<Outlet />`. Redirects to `/login` when there is no admin profile.
- `src/components/app-sidebar.tsx` — navigation, rendered from the enabled pages in the registry.
- `src/lib/pages.tsx` — page registry (`pageRegistry`), `PagesProvider`/`usePages`, and `planPages`. Core pages (overview, users, integrations, page management) are always on; optional pages (organizations, llm) can be switched off. Disabled ids persist in localStorage (`teamx-admin.disabled-pages`). To add a page: add a registry entry, a route in `src/App.tsx` (wrap optional ones in `<Gate id>`), and the page file.
- Page management can be changed manually (switches) or by `planPages`, which asks the configured LLM for `{enable, disable}` ids, falling back to keyword matching when no LLM is set up. Only optional pages are ever changed.
- `src/pages/` — one file per route: overview (analytics), users, organizations (organizations with their companies nested beneath), llm-setup, page-management, integrations (LLM API and Supabase connection forms, schema inspector, schema analysis), login.
- `src/hooks/use-async.ts` + `src/components/data-state.tsx` — load/skeleton/error handling shared by every page.

## Conventions

- Pages fetch only through `src/lib/api.ts`, never `supabase` directly. The Integrations page is the exception: it talks to user-supplied projects and LLM providers through `src/lib/inspect.ts` and `src/lib/llm.ts` (see the Supabase schema doc).
- Charts (Recharts) take colors from `--chart-*` tokens, not hard-coded values.
- Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the app runs in demo mode on `src/lib/mock-data.ts`; the header shows a badge.
