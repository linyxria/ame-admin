import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '../layouts/admin'

export const Route = createFileRoute('/_admin')({
  component: AdminLayout,
  beforeLoad: async ({ context, location }) => {
    const { data } = await context.auth.getSession()

    if (!data) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
        replace: true,
      })
    }

    return {
      session: data.session,
      user: data.user,
    }
  },
})
