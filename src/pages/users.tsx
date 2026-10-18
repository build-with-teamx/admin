import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { DataState } from "@/components/data-state"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAsync } from "@/hooks/use-async"
import { getUsers } from "@/lib/api"
import type { UserStatus } from "@/lib/types"
import { formatDate, initials } from "@/lib/utils"

const statusVariant: Record<UserStatus, "default" | "secondary" | "destructive"> = {
  active: "default",
  invited: "secondary",
  suspended: "destructive",
}

export function UsersPage() {
  const users = useAsync(getUsers)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (users.data ?? []).filter(
      (u) => !q || u.email.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)
    )
  }, [users.data, query])

  return (
    <>
      <PageHeader title="Users" description="Accounts mirrored from Supabase Auth into profiles.">
        <div className="relative w-64">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </PageHeader>
      <Card className="py-2">
        <CardContent className="px-4">
          <DataState state={users}>
            {() => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last sign-in</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                            <AvatarFallback>{initials(user.full_name ?? user.email)}</AvatarFallback>
                          </Avatar>
                          <div className="leading-tight">
                            <div className="font-medium">{user.full_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No users match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </DataState>
        </CardContent>
      </Card>
    </>
  )
}
