import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { authClient } from '../lib/auth-client'

interface RouterContext {
  auth: Pick<typeof authClient, 'getSession' | 'signIn' | 'signOut'>
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
