import { useState, type FormEvent } from "react"
import { Database, Sparkles } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { defaultModels, loadIntegrations, saveIntegrations, type Integrations } from "@/lib/integrations"
import { inspectSupabase } from "@/lib/inspect"
import { runPrompt, schemaPrompt } from "@/lib/llm"
import { demoInsights, demoSchema } from "@/lib/mock-data"
import type { LlmProvider, SchemaTable } from "@/lib/types"

const providers: LlmProvider[] = ["anthropic", "openai", "google", "mistral"]

type Source = "live" | "demo"

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err)
}

function StatusBadge({ connected }: { connected: boolean }) {
  return <Badge variant={connected ? "default" : "secondary"}>{connected ? "Configured" : "Not configured"}</Badge>
}

function LlmCard({
  integrations,
  onChange,
}: {
  integrations: Integrations
  onChange: (next: Integrations) => void
}) {
  const current = integrations.llm
  const [provider, setProvider] = useState<LlmProvider>(current?.provider ?? "anthropic")
  const [model, setModel] = useState(current?.model ?? defaultModels.anthropic)
  const [apiKey, setApiKey] = useState(current?.apiKey ?? "")
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const draft = { provider, model: model.trim(), apiKey: apiKey.trim() }

  const onProviderChange = (next: LlmProvider) => {
    setProvider(next)
    setModel(defaultModels[next])
  }

  const onSave = (event: FormEvent) => {
    event.preventDefault()
    onChange({ ...integrations, llm: draft })
    setMessage({ ok: true, text: "Saved to this browser." })
  }

  const onTest = async () => {
    setTesting(true)
    setMessage(null)
    try {
      await runPrompt(draft, "Reply with the single word: ok")
      setMessage({ ok: true, text: "Connection works." })
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>LLM API</CardTitle>
          <StatusBadge connected={Boolean(current)} />
        </div>
        <CardDescription>Powers the Supabase intelligence below. Set this up first.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="llm-provider">Provider</Label>
              <Select value={provider} onValueChange={(value) => onProviderChange(value as LlmProvider)}>
                <SelectTrigger id="llm-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="llm-model">Model</Label>
              <Input id="llm-model" required value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="llm-key">API key</Label>
            <Input
              id="llm-key"
              type="password"
              required
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          {message && (
            <p className={message.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
              {message.text}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" disabled={testing || !draft.apiKey || !draft.model} onClick={() => void onTest()}>
              {testing ? "Testing…" : "Test connection"}
            </Button>
            {current && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onChange({ ...integrations, llm: null })
                  setApiKey("")
                  setMessage(null)
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function SupabaseCard({
  integrations,
  onChange,
  onInspect,
  inspecting,
  error,
}: {
  integrations: Integrations
  onChange: (next: Integrations) => void
  onInspect: (url: string, key: string) => void
  inspecting: boolean
  error: string | null
}) {
  const current = integrations.supabase
  const [url, setUrl] = useState(current?.url ?? "")
  const [key, setKey] = useState(current?.key ?? "")

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next = { url: url.trim(), key: key.trim() }
    onChange({ ...integrations, supabase: next })
    onInspect(next.url, next.key)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Supabase</CardTitle>
          <StatusBadge connected={Boolean(current)} />
        </div>
        <CardDescription>
          Save a project URL and key to inspect its tables. Use the service-role (secret) key — projects
          only expose their schema to it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sb-url">Project URL</Label>
            <Input
              id="sb-url"
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sb-key">Service-role key</Label>
            <Input
              id="sb-key"
              type="password"
              required
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Keys are stored in this browser only and sent only to Supabase. Don't use this on a shared machine.
          </p>
          <div className="flex gap-2">
            <Button type="submit" disabled={inspecting}>
              {inspecting ? "Inspecting…" : "Save & inspect"}
            </Button>
            {current && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onChange({ ...integrations, supabase: null })
                  setKey("")
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function SchemaCard({
  tables,
  source,
  integrations,
}: {
  tables: SchemaTable[]
  source: Source
  integrations: Integrations
}) {
  const [insights, setInsights] = useState<string | null>(source === "demo" ? demoInsights : null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async () => {
    if (!integrations.llm) return
    setRunning(true)
    setError(null)
    try {
      setInsights(await runPrompt(integrations.llm, schemaPrompt(tables)))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4" /> Schema
          </CardTitle>
          <Badge variant={source === "live" ? "default" : "secondary"}>
            {source === "live" ? "Live project" : "Demo schema"}
          </Badge>
        </div>
        <CardDescription>
          {tables.length} tables. Expand a table to see its columns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {tables.map((t) => (
            <details key={t.name} className="rounded-md border px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium">
                {t.name} <span className="font-normal text-muted-foreground">· {t.columns.length} columns</span>
              </summary>
              <ul className="mt-2 space-y-1 text-xs">
                {t.columns.map((c) => (
                  <li key={c.name} className="flex justify-between gap-4">
                    <span>
                      {c.name}
                      {c.primaryKey && <Badge variant="outline" className="ml-2">pk</Badge>}
                      {c.required && !c.primaryKey && <span className="ml-1 text-muted-foreground">*</span>}
                    </span>
                    <span className="font-mono text-muted-foreground">{c.type}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4" /> Intelligence
            </h3>
            <Button size="sm" disabled={!integrations.llm || running} onClick={() => void analyze()}>
              {running ? "Analyzing…" : "Analyze schema"}
            </Button>
          </div>
          {!integrations.llm && (
            <p className="text-sm text-muted-foreground">Configure an LLM API above to analyze this schema.</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {insights && (
            <pre className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">{insights}</pre>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(loadIntegrations)
  const [tables, setTables] = useState<SchemaTable[] | null>(null)
  const [source, setSource] = useState<Source>("live")
  const [inspecting, setInspecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (next: Integrations) => {
    setIntegrations(next)
    saveIntegrations(next)
  }

  const inspect = async (url: string, key: string) => {
    setInspecting(true)
    setError(null)
    try {
      setTables(await inspectSupabase({ url, key }))
      setSource("live")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setInspecting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect an LLM and a Supabase project to inspect your database. Nothing is connected yet? Load the demo schema to try it out."
      >
        <Button
          variant="outline"
          onClick={() => {
            setTables(demoSchema)
            setSource("demo")
            setError(null)
          }}
        >
          Load demo schema
        </Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <LlmCard integrations={integrations} onChange={update} />
        <SupabaseCard
          integrations={integrations}
          onChange={update}
          onInspect={(url, key) => void inspect(url, key)}
          inspecting={inspecting}
          error={error}
        />
      </div>

      {tables && (
        <div className="mt-6">
          {/* key forces a fresh insights state when switching between demo and live schemas */}
          <SchemaCard key={`${source}-${tables.length}`} tables={tables} source={source} integrations={integrations} />
        </div>
      )}
    </>
  )
}
