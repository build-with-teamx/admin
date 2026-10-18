import { useState } from "react"

import { DataState } from "@/components/data-state"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAsync } from "@/hooks/use-async"
import { getLlmConfigs, setLlmConfigEnabled } from "@/lib/api"
import type { LlmScope } from "@/lib/types"

const scopeTargets: { scope: LlmScope; table: string; description: string }[] = [
  { scope: "global", table: "auth / profiles", description: "Default for every signed-in user." },
  { scope: "organization", table: "organizations", description: "Overrides the global default for an organization." },
  { scope: "company", table: "companies", description: "Most specific; overrides organization and global." },
]

export function LlmSetupPage() {
  const configs = useAsync(getLlmConfigs)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const toggle = async (id: string, next: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: next }))
    setError(null)
    try {
      await setLlmConfigEnabled(id, next)
    } catch (err) {
      setOverrides((prev) => ({ ...prev, [id]: !next }))
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <>
      <PageHeader
        title="LLM setup"
        description="Provider and model bindings. The most specific enabled config wins: company, then organization, then global."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {scopeTargets.map(({ scope, table, description }) => (
          <Card key={scope} className="gap-2">
            <CardHeader>
              <CardTitle className="capitalize">{scope}</CardTitle>
              <CardDescription>
                Maps to <code className="text-foreground">{table}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-destructive">Update failed: {error}</p>}

      <Card className="py-2">
        <CardContent className="px-4">
          <DataState state={configs}>
            {(rows) => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scope</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Max tokens</TableHead>
                    <TableHead className="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant="outline">{config.scope}</Badge>
                      </TableCell>
                      <TableCell>{config.target_name ?? "All"}</TableCell>
                      <TableCell>{config.purpose}</TableCell>
                      <TableCell>{config.provider}</TableCell>
                      <TableCell className="font-mono text-xs">{config.model}</TableCell>
                      <TableCell className="text-right">{config.max_tokens}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Switch
                            checked={overrides[config.id] ?? config.is_enabled}
                            onCheckedChange={(next) => void toggle(config.id, next)}
                            aria-label={`Toggle ${config.purpose} config`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataState>
        </CardContent>
      </Card>
    </>
  )
}
