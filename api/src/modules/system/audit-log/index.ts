import { count, desc, ilike, or } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { auditLog } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { paginated, parsePagination } from "@/lib/pagination"
import { systemPermissionMacro } from "../rbac/service"
import { auditLogsQuery } from "./model"

export const auditLogRoutes = new Elysia({ name: "system.audit-logs", prefix: "/audit-logs" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async ({ query }) => {
      const keyword = query.keyword?.trim()
      const { page, pageSize, offset } = parsePagination(query)
      const where = keyword
        ? or(
            ilike(auditLog.summary, `%${keyword}%`),
            ilike(auditLog.actorName, `%${keyword}%`),
            ilike(auditLog.actorEmail, `%${keyword}%`),
            ilike(auditLog.resource, `%${keyword}%`),
            ilike(auditLog.action, `%${keyword}%`),
          )
        : undefined

      const [totalRow] = await db.select({ value: count() }).from(auditLog).where(where)
      const items = await db
        .select()
        .from(auditLog)
        .where(where)
        .orderBy(desc(auditLog.createdAt))
        .limit(pageSize)
        .offset(offset)

      return paginated(items, totalRow?.value ?? 0, page, pageSize)
    },
    {
      auth: true,
      menu: "/system/audit-logs",
      query: auditLogsQuery,
    },
  )
