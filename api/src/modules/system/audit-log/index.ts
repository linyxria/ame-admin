import { desc, ilike, or } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { auditLog } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { systemPermissionMacro } from "../rbac/service"
import { auditLogsQuery } from "./model"

export const auditLogRoutes = new Elysia({ name: "system.audit-logs", prefix: "/audit-logs" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async ({ query }) => {
      const keyword = query.keyword?.trim()

      return db
        .select()
        .from(auditLog)
        .where(
          keyword
            ? or(
                ilike(auditLog.summary, `%${keyword}%`),
                ilike(auditLog.actorName, `%${keyword}%`),
                ilike(auditLog.actorEmail, `%${keyword}%`),
                ilike(auditLog.resource, `%${keyword}%`),
                ilike(auditLog.action, `%${keyword}%`),
              )
            : undefined,
        )
        .orderBy(desc(auditLog.createdAt))
        .limit(200)
    },
    {
      auth: true,
      menu: "/system/audit-logs",
      query: auditLogsQuery,
    },
  )
