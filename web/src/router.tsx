import { createRouter } from '@tanstack/react-router'
import { authClient } from './lib/auth-client'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: {
      getSession: authClient.getSession,
      signIn: authClient.signIn,
      signOut: authClient.signOut,
    },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
