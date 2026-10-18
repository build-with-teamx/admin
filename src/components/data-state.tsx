import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"

/** Renders skeleton / error / content for a `useAsync` result. */
export function DataState<T>({
  state,
  children,
}: {
  state: { data: T | null; error: string | null; loading: boolean }
  children: (data: T) => ReactNode
}) {
  if (state.error) {
    return <p className="text-sm text-destructive">Failed to load: {state.error}</p>
  }
  if (state.loading || !state.data) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }
  return <>{children(state.data)}</>
}
