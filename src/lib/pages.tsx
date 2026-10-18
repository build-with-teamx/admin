import { createContext, useContext, useState, type ReactNode } from "react"
import { Bot, LayoutDashboard, Network, Plug, SlidersHorizontal, Users, type LucideIcon } from "lucide-react"

import type { LlmIntegration } from "./integrations"
import { runPrompt } from "./llm"

export interface PageDef {
  id: string
  path: string
  label: string
  description: string
  icon: LucideIcon
  /** Core pages are always visible; the rest can be switched off. */
  core: boolean
  /** Used by the keyword fallback when no LLM is configured. */
  keywords: string[]
}

export const pageRegistry: PageDef[] = [
  { id: "overview", path: "/", label: "Overview", description: "Analytics across users, organizations and LLM usage.", icon: LayoutDashboard, core: true, keywords: [] },
  { id: "users", path: "/users", label: "Users", description: "Accounts and roles.", icon: Users, core: true, keywords: [] },
  { id: "organizations", path: "/organizations", label: "Organizations", description: "Organizations with their companies.", icon: Network, core: false, keywords: ["organization", "organisation", "company", "companies", "billing", "customer", "account"] },
  { id: "llm", path: "/llm", label: "LLM setup", description: "Provider and model bindings per scope.", icon: Bot, core: false, keywords: ["llm", "model", "provider", "token", "ai"] },
  { id: "integrations", path: "/integrations", label: "Integrations", description: "LLM API and Supabase connections.", icon: Plug, core: true, keywords: [] },
  { id: "pages", path: "/pages", label: "Page management", description: "Show or hide optional pages.", icon: SlidersHorizontal, core: true, keywords: [] },
]

const STORAGE_KEY = "teamx-admin.disabled-pages"

function loadDisabled(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    // Corrupt or unavailable storage: show everything.
  }
  return []
}

interface PagesState {
  enabledPages: PageDef[]
  isEnabled: (id: string) => boolean
  /** Applies { pageId: enabled } changes; core and unknown ids are ignored. */
  setEnabled: (changes: Record<string, boolean>) => void
}

const PagesContext = createContext<PagesState | null>(null)

export function PagesProvider({ children }: { children: ReactNode }) {
  const [disabled, setDisabled] = useState(loadDisabled)

  const isEnabled = (id: string) => {
    const page = pageRegistry.find((p) => p.id === id)
    return Boolean(page) && (page!.core || !disabled.includes(id))
  }

  const setEnabled = (changes: Record<string, boolean>) => {
    const next = new Set(disabled)
    for (const [id, enabled] of Object.entries(changes)) {
      const page = pageRegistry.find((p) => p.id === id)
      if (!page || page.core) continue
      if (enabled) next.delete(id)
      else next.add(id)
    }
    const list = [...next]
    setDisabled(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  return (
    <PagesContext.Provider value={{ enabledPages: pageRegistry.filter((p) => isEnabled(p.id)), isEnabled, setEnabled }}>
      {children}
    </PagesContext.Provider>
  )
}

export function usePages() {
  const context = useContext(PagesContext)
  if (!context) throw new Error("usePages must be used within PagesProvider")
  return context
}

export interface PagePlan {
  changes: Record<string, boolean>
  via: "llm" | "keywords"
}

/**
 * Turns a plain-language request into page toggles. Uses the configured LLM,
 * or a keyword match when none is set up.
 */
export async function planPages(
  request: string,
  isEnabled: (id: string) => boolean,
  llm: LlmIntegration | null
): Promise<PagePlan> {
  const optional = pageRegistry.filter((p) => !p.core)

  if (!llm) {
    const turnOff = /\b(disable|hide|remove|turn off|without)\b/i.test(request)
    const text = request.toLowerCase()
    const changes: Record<string, boolean> = {}
    for (const page of optional) {
      if (page.keywords.some((k) => text.includes(k))) changes[page.id] = !turnOff
    }
    return { changes, via: "keywords" }
  }

  const listing = optional
    .map((p) => `- ${p.id}: ${p.label} — ${p.description} (currently ${isEnabled(p.id) ? "enabled" : "disabled"})`)
    .join("\n")
  const reply = await runPrompt(
    llm,
    [
      "You manage which optional pages of an admin dashboard are visible.",
      "Optional pages:",
      listing,
      `Request: ${request}`,
      'Reply with only JSON: {"enable": [page ids], "disable": [page ids]}. Use only the ids listed; leave pages the request does not affect out of both lists.',
    ].join("\n")
  )

  const json = reply.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error("The model did not return a page plan.")
  const parsed = JSON.parse(json) as { enable?: string[]; disable?: string[] }
  const changes: Record<string, boolean> = {}
  for (const page of optional) {
    if (parsed.enable?.includes(page.id)) changes[page.id] = true
    if (parsed.disable?.includes(page.id)) changes[page.id] = false
  }
  return { changes, via: "llm" }
}
