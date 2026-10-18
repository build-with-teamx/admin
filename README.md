# TeamX Admin

Internal admin dashboard for TeamX: sidebar navigation, an analytics overview, and management views for users, organizations, companies and LLM setup. Built with React, Vite, Tailwind CSS v4, shadcn/ui and Supabase.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — omit to run on demo data
npm run dev
```

## Connecting Supabase

1. Create a Supabase project and run `supabase/migrations/0001_admin_schema.sql`.
2. Put the project URL and anon key in `.env.local`.
3. Promote your first admin in the SQL editor:
   `update public.profiles set role = 'super_admin' where email = 'you@example.com';`
4. Sign in on `/login`.

## Integrations page

No env vars needed: open **Integrations**, add an LLM API key first, then a Supabase project URL and service-role key to inspect its tables and run an LLM schema analysis. Use **Load demo schema** to try it with sample data. Credentials stay in your browser's localStorage.

Architecture notes live in [TEAMX.md](TEAMX.md).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build
- `npm run typecheck` — type-check only

## License

MIT
