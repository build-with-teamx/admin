import { supabase } from "./supabase"
import {
  mockCompanies,
  mockLlmConfigs,
  mockOrganizations,
  mockOverviewStats,
  mockTimeseries,
  mockUsers,
} from "./mock-data"
import type {
  Company,
  LlmConfig,
  Organization,
  OverviewStats,
  Profile,
  TimeseriesPoint,
} from "./types"

// Every query reads from Supabase when configured and falls back to demo data
// otherwise, so the dashboard is usable straight after `npm run dev`.

export async function getOverviewStats(): Promise<OverviewStats> {
  if (!supabase) return mockOverviewStats
  const { data, error } = await supabase.rpc("admin_overview_stats")
  if (error) throw error
  return data as OverviewStats
}

export async function getTimeseries(): Promise<TimeseriesPoint[]> {
  if (!supabase) return mockTimeseries
  const since = new Date(Date.now() - 29 * 86_400_000).toISOString()
  const [profiles, usage] = await Promise.all([
    supabase.from("profiles").select("created_at").gte("created_at", since),
    supabase.from("llm_usage").select("created_at, input_tokens, output_tokens").gte("created_at", since),
  ])
  if (profiles.error) throw profiles.error
  if (usage.error) throw usage.error

  const label = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const points = new Map<string, TimeseriesPoint>()
  for (let i = 29; i >= 0; i--) {
    const date = label(new Date(Date.now() - i * 86_400_000).toISOString())
    points.set(date, { date, signups: 0, tokens: 0 })
  }
  for (const row of profiles.data) {
    const point = points.get(label(row.created_at))
    if (point) point.signups += 1
  }
  for (const row of usage.data) {
    const point = points.get(label(row.created_at))
    if (point) point.tokens += row.input_tokens + row.output_tokens
  }
  return [...points.values()]
}

export async function getUsers(): Promise<Profile[]> {
  if (!supabase) return mockUsers
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, status, last_sign_in_at, created_at")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Profile[]
}

export async function getOrganizations(): Promise<Organization[]> {
  if (!supabase) return mockOrganizations
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, owner_id, plan, created_at, organization_members(count)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data.map(({ organization_members, ...org }) => ({
    ...org,
    member_count: organization_members[0]?.count ?? 0,
  })) as Organization[]
}

export async function getCompanies(): Promise<Company[]> {
  if (!supabase) return mockCompanies
  const { data, error } = await supabase
    .from("companies")
    .select("id, org_id, name, domain, industry, size, status, created_at, organizations(name)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data.map(({ organizations, ...company }) => ({
    ...company,
    org_name: (organizations as unknown as { name: string } | null)?.name ?? "—",
  })) as Company[]
}

export async function getLlmConfigs(): Promise<LlmConfig[]> {
  if (!supabase) return mockLlmConfigs
  const { data, error } = await supabase
    .from("llm_configs")
    .select(
      "id, scope, purpose, provider, model, temperature, max_tokens, is_enabled, organizations(name), companies(name)"
    )
    .order("scope")
  if (error) throw error
  return data.map(({ organizations, companies, ...config }) => ({
    ...config,
    target_name:
      (companies as unknown as { name: string } | null)?.name ??
      (organizations as unknown as { name: string } | null)?.name ??
      null,
  })) as LlmConfig[]
}

export async function setLlmConfigEnabled(id: string, isEnabled: boolean): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from("llm_configs").update({ is_enabled: isEnabled }).eq("id", id)
  if (error) throw error
}
