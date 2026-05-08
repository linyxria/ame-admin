import { t } from "elysia"
import { paginationQuery } from "@/lib/pagination"

export const notificationsQuery = t.Object({
  ...paginationQuery,
  type: t.Optional(t.String()),
  read: t.Optional(t.String()),
})
