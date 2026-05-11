import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/dashboard")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/dashboard") {
      throw redirect({ to: "/dashboard/workbench", replace: true })
    }
  },
})
