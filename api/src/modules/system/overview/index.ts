import { count, desc, isNull } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { auditLog, menu, notification, role, user } from "@/db/schema"
import { authMacro } from "@/lib/auth"

export const overviewRoutes = new Elysia({ name: "system.overview", prefix: "/overview" })
  .use(authMacro)
  .get(
    "/",
    async () => {
      const [users, roles, menus, unreadNotifications, latestAuditLogs] = await Promise.all([
        db.select({ value: count() }).from(user),
        db.select({ value: count() }).from(role),
        db.select({ value: count() }).from(menu),
        db.select({ value: count() }).from(notification).where(isNull(notification.readAt)),
        db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(5),
      ])

      return {
        users: users[0]?.value ?? 0,
        roles: roles[0]?.value ?? 0,
        menus: menus[0]?.value ?? 0,
        unreadNotifications: unreadNotifications[0]?.value ?? 0,
        latestAuditLogs,
      }
    },
    { auth: true },
  )
