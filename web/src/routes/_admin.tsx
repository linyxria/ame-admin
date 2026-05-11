import { createFileRoute, redirect } from "@tanstack/react-router"
import { AdminLayout } from "../layouts/admin"
import { isExamplePath } from "../lib/examples"
import { sessionQueryOptions } from "../services/auth/queries"
import { currentUserMenusQueryOptions } from "../services/system/queries"

const publicAdminPaths = new Set(["/dashboard", "/account/settings", "/forbidden"])

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: async ({ context, location }) => {
    const { data } = await context.queryClient.ensureQueryData(sessionQueryOptions())

    if (!data) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      })
    }

    if (!publicAdminPaths.has(location.pathname) && !isExamplePath(location.pathname)) {
      const menus = await context.queryClient.ensureQueryData(currentUserMenusQueryOptions())
      const canAccess = (menus ?? []).some(
        (menu) => menu.path === location.pathname || location.pathname.startsWith(`${menu.path}/`),
      )

      if (!canAccess) {
        throw redirect({
          to: "/forbidden",
          replace: true,
        })
      }
    }

    return {
      session: data.session,
      user: data.user,
    }
  },
})
