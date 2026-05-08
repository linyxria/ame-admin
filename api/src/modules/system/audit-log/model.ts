import { t } from "elysia"
import { paginationQuery } from "@/lib/pagination"

export const auditLogsQuery = t.Object({
  ...paginationQuery,
})
