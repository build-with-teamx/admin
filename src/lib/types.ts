// Row shapes mirror supabase/migrations/0001_admin_schema.sql.

export type UserRole = "user" | "admin" | "super_admin"
export type UserStatus = "active" | "suspended" | "invited"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  last_sign_in_at: string | null
  created_at: string
}

export type OrgPlan = "free" | "pro" | "enterprise"

export interface Organization {
  id: string
  name: string
  slug: string
  owner_id: string | null
  plan: OrgPlan
  member_count: number
  created_at: string
}

export type CompanyStatus = "active" | "trial" | "churned"

export interface Company {
  id: string
  org_id: string
  org_name: string
  name: string
  domain: string | null
  industry: string | null
  size: "1-10" | "11-50" | "51-200" | "201-1000" | "1000+" | null
  status: CompanyStatus
  created_at: string
}

export type LlmScope = "global" | "organization" | "company"
export type LlmPurpose = "chat" | "summarization" | "embedding"
export type LlmProvider = "anthropic" | "openai" | "google" | "mistral"

export interface LlmConfig {
  id: string
  scope: LlmScope
  /** Display name of the org/company the config applies to; null for global. */
  target_name: string | null
  purpose: LlmPurpose
  provider: LlmProvider
  model: string
  temperature: number
  max_tokens: number
  is_enabled: boolean
}

export interface OverviewStats {
  total_users: number
  active_users: number
  organizations: number
  companies: number
  llm_tokens_30d: number
  llm_cost_30d: number
}

export interface SchemaColumn {
  name: string
  type: string
  required: boolean
  primaryKey: boolean
}

export interface SchemaTable {
  name: string
  columns: SchemaColumn[]
}

export interface TimeseriesPoint {
  date: string
  signups: number
  tokens: number
}
