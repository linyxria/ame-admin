import { queryOptions } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

const SESSION_STALE_TIME = 60_000

export const sessionQueryKey = ["auth", "session"] as const

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKey,
    queryFn: () => authClient.getSession(),
    staleTime: SESSION_STALE_TIME,
  })
}
