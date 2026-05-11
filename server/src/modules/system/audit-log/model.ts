import { t } from "elysia"
import { paginationQuery } from "@/lib/pagination"

export const auditLogsQuery = t.Object({
  ...paginationQuery,
})

export type AuditLogsQuery = typeof auditLogsQuery.static

export const auditLogModels = {
  "System.AuditLogsQuery": auditLogsQuery,
}
