import { createFileRoute, redirect } from "@tanstack/react-router"
import { AdminLayout } from "../layouts/admin"
import { systemApi, systemQueryKeys } from "../lib/system-api"

const publicAdminPaths = new Set(["/dashboard", "/account/settings", "/forbidden"])

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  beforeLoad: async ({ context, location }) => {
    const { data } = await context.auth.getSession()

    if (!data) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      })
    }

    if (!publicAdminPaths.has(location.pathname)) {
      const menus = await context.queryClient.ensureQueryData({
        queryKey: systemQueryKeys.myMenus,
        queryFn: systemApi.myMenus,
      })
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
