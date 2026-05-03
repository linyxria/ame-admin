import { createRouter } from "@tanstack/react-router"
import { authClient } from "./lib/auth-client"
import { queryClient } from "./lib/query-client"
import { routeTree } from "./route-tree.gen"

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: {
      getSession: authClient.getSession,
      signIn: authClient.signIn,
      signOut: authClient.signOut,
    },
    queryClient,
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
