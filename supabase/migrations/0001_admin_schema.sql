-- TeamX Admin — initial schema.
--
-- Maps the admin dashboard onto four entity groups:
--   auth          -> auth.users (managed by Supabase) mirrored by public.profiles
--   user          -> public.profiles
--   organization  -> public.organizations + public.organization_members
--   company       -> public.companies (owned by an organization)
-- plus the LLM setup tables (llm_configs, llm_usage) that bind a provider/model
-- to a scope (global, organization or company).
--
-- API keys are never stored here. llm_configs.api_key_secret_id points at a
-- Supabase Vault secret.

create extension if not exists pgcrypto;

-- ─── shared helpers ────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

-- ─── profiles (user) ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'suspended', 'invited')),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Mirror every new auth user into profiles.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Keep profiles.last_sign_in_at in step with auth.users.
create or replace function public.sync_last_sign_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  update public.profiles set last_sign_in_at = new.last_sign_in_at where id = new.id;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_signed_in on auth.users;
create trigger on_auth_user_signed_in
  after update of last_sign_in_at on auth.users
  for each row execute function public.sync_last_sign_in();

-- ─── organizations ─────────────────────────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references public.profiles(id) on delete set null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organizations_owner_idx on public.organizations (owner_id);

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists organization_members_org_idx on public.organization_members (org_id);
create index if not exists organization_members_user_idx on public.organization_members (user_id);

-- ─── companies ─────────────────────────────────────────────────────
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  domain text,
  industry text,
  size text check (size in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  status text not null default 'active' check (status in ('active', 'trial', 'churned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_org_idx on public.companies (org_id);

drop trigger if exists companies_touch_updated_at on public.companies;
create trigger companies_touch_updated_at
  before update on public.companies
  for each row execute function public.touch_updated_at();

-- ─── LLM setup ─────────────────────────────────────────────────────
-- One row binds a provider/model to a purpose at a scope. Resolution order at
-- runtime: company -> organization -> global.
create table if not exists public.llm_configs (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'global' check (scope in ('global', 'organization', 'company')),
  org_id uuid references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  purpose text not null default 'chat' check (purpose in ('chat', 'summarization', 'embedding')),
  provider text not null check (provider in ('anthropic', 'openai', 'google', 'mistral')),
  model text not null,
  temperature numeric(3, 2) not null default 0.2 check (temperature >= 0 and temperature <= 2),
  max_tokens integer not null default 4096 check (max_tokens > 0),
  api_key_secret_id uuid,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope = 'global' and org_id is null and company_id is null) or
    (scope = 'organization' and org_id is not null and company_id is null) or
    (scope = 'company' and company_id is not null)
  )
);

create unique index if not exists llm_configs_scope_purpose_idx
  on public.llm_configs (
    scope,
    coalesce(org_id, '00000000-0000-0000-0000-000000000000'),
    coalesce(company_id, '00000000-0000-0000-0000-000000000000'),
    purpose
  );

drop trigger if exists llm_configs_touch_updated_at on public.llm_configs;
create trigger llm_configs_touch_updated_at
  before update on public.llm_configs
  for each row execute function public.touch_updated_at();

create table if not exists public.llm_usage (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists llm_usage_created_idx on public.llm_usage (created_at desc);
create index if not exists llm_usage_org_idx on public.llm_usage (org_id);

-- ─── access control ────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin') and status = 'active'
  );
$fn$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.companies enable row level security;
alter table public.llm_configs enable row level security;
alter table public.llm_usage enable row level security;

-- Admins can read and write everything in the dashboard.
create policy "admins manage profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "admins manage organizations" on public.organizations
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage organization members" on public.organization_members
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage companies" on public.companies
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage llm configs" on public.llm_configs
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins read llm usage" on public.llm_usage
  for select using (public.is_admin());

-- ─── analytics ─────────────────────────────────────────────────────
-- Single round-trip for the overview page. security invoker so RLS applies.
create or replace function public.admin_overview_stats()
returns jsonb
language sql
stable
security invoker
as $fn$
  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'active_users', (select count(*) from public.profiles where status = 'active'),
    'organizations', (select count(*) from public.organizations),
    'companies', (select count(*) from public.companies),
    'llm_tokens_30d', (
      select coalesce(sum(input_tokens + output_tokens), 0)
      from public.llm_usage where created_at > now() - interval '30 days'
    ),
    'llm_cost_30d', (
      select coalesce(sum(cost_usd), 0)
      from public.llm_usage where created_at > now() - interval '30 days'
    )
  );
$fn$;
