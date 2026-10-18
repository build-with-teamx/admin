import { Fragment } from "react"

import { DataState } from "@/components/data-state"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAsync } from "@/hooks/use-async"
import { getCompanies, getOrganizations } from "@/lib/api"
import type { CompanyStatus } from "@/lib/types"
import { formatDate } from "@/lib/utils"

const statusVariant: Record<CompanyStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  trial: "secondary",
  churned: "destructive",
}

export function OrganizationsPage() {
  const orgs = useAsync(getOrganizations)
  const companies = useAsync(getCompanies)

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Billing accounts with the companies they own listed underneath."
      />
      <Card className="py-2">
        <CardContent className="px-4">
          <DataState state={orgs}>
            {(orgRows) => (
              <DataState state={companies}>
                {(companyRows) => (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Plan / Industry</TableHead>
                        <TableHead>Members / Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgRows.map((org) => (
                        <Fragment key={org.id}>
                          <TableRow className="bg-muted/30">
                            <TableCell>
                              <div className="leading-tight">
                                <div className="font-medium">{org.name}</div>
                                <div className="text-xs text-muted-foreground">{org.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={org.plan === "free" ? "secondary" : "default"}>{org.plan}</Badge>
                            </TableCell>
                            <TableCell>{org.member_count} members</TableCell>
                            <TableCell className="text-muted-foreground">—</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(org.created_at)}</TableCell>
                          </TableRow>
                          {companyRows
                            .filter((company) => company.org_id === org.id)
                            .map((company) => (
                              <TableRow key={company.id}>
                                <TableCell className="pl-8">
                                  <div className="leading-tight">
                                    <div>{company.name}</div>
                                    <div className="text-xs text-muted-foreground">{company.domain ?? "—"}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{company.industry ?? "—"}</TableCell>
                                <TableCell>{company.size ?? "—"}</TableCell>
                                <TableCell>
                                  <Badge variant={statusVariant[company.status]}>{company.status}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {formatDate(company.created_at)}
                                </TableCell>
                              </TableRow>
                            ))}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataState>
            )}
          </DataState>
        </CardContent>
      </Card>
    </>
  )
}
