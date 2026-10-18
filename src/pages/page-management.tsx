import { useState, type FormEvent } from "react"
import { Sparkles } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { loadIntegrations } from "@/lib/integrations"
import { pageRegistry, planPages, usePages } from "@/lib/pages"

export function PageManagementPage() {
  const { isEnabled, setEnabled } = usePages()
  const [request, setRequest] = useState("")
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setWorking(true)
    setResult(null)
    try {
      const { changes, via } = await planPages(request, isEnabled, loadIntegrations().llm)
      const entries = Object.entries(changes)
      setEnabled(changes)
      const summary = entries.length
        ? entries
            .map(([id, on]) => `${on ? "Enabled" : "Disabled"} ${pageRegistry.find((p) => p.id === id)?.label}`)
            .join(", ")
        : "No page changes were needed."
      setResult({ ok: true, text: `${summary} (${via === "llm" ? "via LLM" : "keyword match — no LLM configured"})` })
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : String(err) })
    } finally {
      setWorking(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Page management"
        description="Show or hide optional pages manually, or describe what you need and let the LLM decide."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>Core pages are always on.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {pageRegistry.map((page) => (
              <div key={page.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-start gap-3">
                  <page.icon className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="leading-tight">
                    <div className="text-sm font-medium">{page.label}</div>
                    <div className="text-xs text-muted-foreground">{page.description}</div>
                  </div>
                </div>
                {page.core ? (
                  <Badge variant="secondary">Always on</Badge>
                ) : (
                  <Switch
                    checked={isEnabled(page.id)}
                    onCheckedChange={(on) => setEnabled({ [page.id]: on })}
                    aria-label={`Toggle ${page.label}`}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" /> Ask the LLM
            </CardTitle>
            <CardDescription>
              For example: "I only care about LLM costs" or "hide the organizations page". Uses the LLM from
              Integrations; falls back to keyword matching without one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                required
                placeholder="Describe which pages you need"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
              />
              {result && (
                <p className={result.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
                  {result.text}
                </p>
              )}
              <Button type="submit" disabled={working}>
                {working ? "Updating…" : "Update pages"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
