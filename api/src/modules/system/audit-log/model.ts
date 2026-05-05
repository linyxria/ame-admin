import { t } from "elysia"

export const auditLogsQuery = t.Object({
  keyword: t.Optional(t.String()),
})
