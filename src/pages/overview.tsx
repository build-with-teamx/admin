import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Building2, Coins, Network, Users, type LucideIcon } from "lucide-react"

import { DataState } from "@/components/data-state"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAsync } from "@/hooks/use-async"
import { getOverviewStats, getTimeseries } from "@/lib/api"
import { formatNumber } from "@/lib/utils"

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string
  value: string
  hint: string
  icon: LucideIcon
}) {
  return (
    <Card className="gap-2">
      <CardHeader className="flex-row items-center justify-between">
        <CardDescription>{title}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: "var(--muted-foreground)" },
} as const

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
}

export function OverviewPage() {
  const stats = useAsync(getOverviewStats)
  const series = useAsync(getTimeseries)

  return (
    <>
      <PageHeader title="Overview" description="Platform activity across users, organizations and LLM usage." />

      <DataState state={stats}>
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Users" value={formatNumber(s.total_users)} hint={`${formatNumber(s.active_users)} active`} icon={Users} />
            <StatCard title="Organizations" value={formatNumber(s.organizations)} hint="Billing accounts" icon={Network} />
            <StatCard title="Companies" value={formatNumber(s.companies)} hint="Across all organizations" icon={Building2} />
            <StatCard
              title="LLM tokens (30d)"
              value={formatNumber(s.llm_tokens_30d)}
              hint={`$${s.llm_cost_30d.toFixed(2)} spend`}
              icon={Coins}
            />
          </div>
        )}
      </DataState>

      <div className="mt-6">
        <DataState state={series}>
          {(points) => (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>New users</CardTitle>
                  <CardDescription>Daily signups, last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={points}>
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" interval={4} {...axisProps} />
                      <YAxis width={32} allowDecimals={false} {...axisProps} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="signups"
                        name="Signups"
                        stroke="var(--chart-1)"
                        fill="var(--chart-1)"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>LLM tokens</CardTitle>
                  <CardDescription>Daily input + output tokens, last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={points}>
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" interval={4} {...axisProps} />
                      <YAxis
                        width={44}
                        tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                        {...axisProps}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => formatNumber(Number(v))}
                      />
                      <Line
                        type="monotone"
                        dataKey="tokens"
                        name="Tokens"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </DataState>
      </div>
    </>
  )
}
