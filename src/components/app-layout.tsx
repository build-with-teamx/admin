import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth"
import { usePages } from "@/lib/pages"
import { isSupabaseConfigured } from "@/lib/supabase"
import { initials } from "@/lib/utils"

export function AppLayout() {
  const { loading, profile, signOut } = useAuth()
  const { enabledPages } = usePages()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }
  if (!profile) return <Navigate to="/login" replace />

  const name = profile.full_name ?? profile.email
  const currentPage = enabledPages.find((p) => p.path === pathname)

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {currentPage?.label ?? "Pages"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>Pages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {enabledPages.map(({ path, label, icon: Icon }) => (
                  <DropdownMenuItem key={path} onSelect={() => navigate(path)}>
                    <Icon />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {!isSupabaseConfigured && (
              <Badge variant="secondary">Demo data — set VITE_SUPABASE_URL to connect</Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto gap-3 px-2 py-1">
                <div className="text-right text-sm leading-tight">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs font-normal text-muted-foreground">{profile.role}</div>
                </div>
                <Avatar>
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="truncate">{profile.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void signOut()}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
