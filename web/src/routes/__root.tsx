import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { authClient } from '../lib/auth-client'

interface RouterContext {
  auth: Pick<typeof authClient, 'getSession' | 'signIn' | 'signOut'>
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})
