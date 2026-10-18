import type {
  Company,
  LlmConfig,
  Organization,
  OverviewStats,
  Profile,
  SchemaTable,
  TimeseriesPoint,
} from "./types"

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

// "name:type" pairs; a trailing * marks a primary key, ! marks required.
const table = (name: string, columns: string[]): SchemaTable => ({
  name,
  columns: columns.map((spec) => {
    const [rawName, type] = spec.split(":")
    return {
      name: rawName.replace(/[*!]$/, ""),
      type,
      primaryKey: rawName.endsWith("*"),
      required: rawName.endsWith("*") || rawName.endsWith("!"),
    }
  }),
})

/** Sample schema shown by the Integrations inspector when no Supabase project is connected. */
export const demoSchema: SchemaTable[] = [
  table("profiles", ["id*:uuid", "email!:text", "full_name:text", "avatar_url:text", "role!:text", "status!:text", "last_sign_in_at:timestamptz", "created_at!:timestamptz"]),
  table("organizations", ["id*:uuid", "name!:text", "slug!:text", "owner_id:uuid", "plan!:text", "created_at!:timestamptz"]),
  table("organization_members", ["id*:uuid", "org_id!:uuid", "user_id!:uuid", "role!:text", "created_at!:timestamptz"]),
  table("companies", ["id*:uuid", "org_id!:uuid", "name!:text", "domain:text", "industry:text", "size:text", "status!:text", "created_at!:timestamptz"]),
  table("llm_configs", ["id*:uuid", "scope!:text", "org_id:uuid", "company_id:uuid", "purpose!:text", "provider!:text", "model!:text", "temperature!:numeric", "max_tokens!:integer", "is_enabled!:boolean"]),
  table("llm_usage", ["id*:uuid", "org_id:uuid", "company_id:uuid", "user_id:uuid", "provider!:text", "model!:text", "input_tokens!:integer", "output_tokens!:integer", "cost_usd!:numeric", "created_at!:timestamptz"]),
]

export const demoInsights = `Demo analysis (sample output — connect an LLM API key to analyze your own schema).

Entities
- profiles mirrors auth users and carries role/status, so it is the anchor for access control.
- organizations own companies and have members through organization_members.
- llm_configs and llm_usage track which model each scope uses and what it costs.

Observations
- Tenancy flows organizations -> companies; most reporting queries should group by org_id.
- llm_usage has no index hint on company_id in this sample; add one if per-company cost reports are slow.
- status and role are free text with check constraints; consider enums if the value sets grow.

Suggested questions
- Which organizations spent the most on LLM tokens in the last 30 days?
- Which companies have no members or no recent activity?`

export const mockUsers: Profile[] = [
  { id: "u1", email: "ada@acme.io", full_name: "Ada Lovelace", avatar_url: null, role: "super_admin", status: "active", last_sign_in_at: daysAgo(0), created_at: daysAgo(210) },
  { id: "u2", email: "grace@globex.com", full_name: "Grace Hopper", avatar_url: null, role: "admin", status: "active", last_sign_in_at: daysAgo(1), created_at: daysAgo(180) },
  { id: "u3", email: "alan@initech.dev", full_name: "Alan Turing", avatar_url: null, role: "user", status: "active", last_sign_in_at: daysAgo(3), created_at: daysAgo(120) },
  { id: "u4", email: "linus@umbrella.org", full_name: "Linus Torvalds", avatar_url: null, role: "user", status: "suspended", last_sign_in_at: daysAgo(40), created_at: daysAgo(95) },
  { id: "u5", email: "margaret@hooli.co", full_name: "Margaret Hamilton", avatar_url: null, role: "user", status: "active", last_sign_in_at: daysAgo(2), created_at: daysAgo(60) },
  { id: "u6", email: "dennis@stark.ind", full_name: null, role: "user", avatar_url: null, status: "invited", last_sign_in_at: null, created_at: daysAgo(4) },
]

export const mockOrganizations: Organization[] = [
  { id: "o1", name: "Acme Inc", slug: "acme", owner_id: "u1", plan: "enterprise", member_count: 48, created_at: daysAgo(200) },
  { id: "o2", name: "Globex", slug: "globex", owner_id: "u2", plan: "pro", member_count: 21, created_at: daysAgo(160) },
  { id: "o3", name: "Initech", slug: "initech", owner_id: "u3", plan: "pro", member_count: 12, created_at: daysAgo(110) },
  { id: "o4", name: "Hooli", slug: "hooli", owner_id: "u5", plan: "free", member_count: 5, created_at: daysAgo(50) },
]

export const mockCompanies: Company[] = [
  { id: "c1", org_id: "o1", org_name: "Acme Inc", name: "Acme Robotics", domain: "robotics.acme.io", industry: "Manufacturing", size: "201-1000", status: "active", created_at: daysAgo(190) },
  { id: "c2", org_id: "o1", org_name: "Acme Inc", name: "Acme Labs", domain: "labs.acme.io", industry: "Research", size: "51-200", status: "active", created_at: daysAgo(150) },
  { id: "c3", org_id: "o2", org_name: "Globex", name: "Globex Logistics", domain: "logistics.globex.com", industry: "Logistics", size: "1000+", status: "trial", created_at: daysAgo(30) },
  { id: "c4", org_id: "o3", org_name: "Initech", name: "Initech Software", domain: "initech.dev", industry: "Software", size: "11-50", status: "active", created_at: daysAgo(100) },
  { id: "c5", org_id: "o4", org_name: "Hooli", name: "Hooli XYZ", domain: "xyz.hooli.co", industry: "Media", size: "1-10", status: "churned", created_at: daysAgo(45) },
]

export const mockLlmConfigs: LlmConfig[] = [
  { id: "l1", scope: "global", target_name: null, purpose: "chat", provider: "anthropic", model: "claude-sonnet-5-5", temperature: 0.2, max_tokens: 4096, is_enabled: true },
  { id: "l2", scope: "global", target_name: null, purpose: "summarization", provider: "anthropic", model: "claude-haiku-5-5", temperature: 0.1, max_tokens: 2048, is_enabled: true },
  { id: "l3", scope: "global", target_name: null, purpose: "embedding", provider: "openai", model: "text-embedding-3-small", temperature: 0, max_tokens: 8191, is_enabled: true },
  { id: "l4", scope: "organization", target_name: "Acme Inc", purpose: "chat", provider: "anthropic", model: "claude-opus-5-5", temperature: 0.3, max_tokens: 8192, is_enabled: true },
  { id: "l5", scope: "company", target_name: "Globex Logistics", purpose: "chat", provider: "openai", model: "gpt-4o", temperature: 0.2, max_tokens: 4096, is_enabled: false },
]

export const mockOverviewStats: OverviewStats = {
  total_users: mockUsers.length * 214,
  active_users: mockUsers.length * 171,
  organizations: mockOrganizations.length * 31,
  companies: mockCompanies.length * 26,
  llm_tokens_30d: 48_250_000,
  llm_cost_30d: 612.4,
}

export const mockTimeseries: TimeseriesPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86_400_000)
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    signups: 18 + Math.round(10 * Math.sin(i / 3) + i / 2),
    tokens: Math.round(1_300_000 + 400_000 * Math.sin(i / 4) + i * 20_000),
  }
})
