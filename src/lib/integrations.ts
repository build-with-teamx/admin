import type { LlmProvider } from "./types"

// Integration credentials are entered in the UI and kept in this browser's
// localStorage only. They are sent nowhere except the provider they belong to.

export interface SupabaseIntegration {
  url: string
  key: string
}

export interface LlmIntegration {
  provider: LlmProvider
  model: string
  apiKey: string
}

export interface Integrations {
  supabase: SupabaseIntegration | null
  llm: LlmIntegration | null
}

export const defaultModels: Record<LlmProvider, string> = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
  mistral: "mistral-large-latest",
}

const STORAGE_KEY = "teamx-admin.integrations"

export function loadIntegrations(): Integrations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Integrations>
      return { supabase: parsed.supabase ?? null, llm: parsed.llm ?? null }
    }
  } catch {
    // Corrupt or unavailable storage: start clean.
  }
  return { supabase: null, llm: null }
}

export function saveIntegrations(next: Integrations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
