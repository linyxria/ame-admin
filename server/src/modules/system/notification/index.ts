import { and, count, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { notification } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { paginated, parsePagination } from "@/lib/pagination"
import { notificationsQuery } from "./model"

export const notificationRoutes = new Elysia({
  name: "system.notifications",
  prefix: "/notifications",
})
  .use(authMacro)
  .get(
    "/",
    async ({ query, user: currentUser }) => {
      const { page, pageSize, offset } = parsePagination(query)
      const keyword = query.keyword?.trim()
      const ownerWhere = or(eq(notification.userId, currentUser.id), isNull(notification.userId))
      const where = and(
        ownerWhere,
        query.type ? eq(notification.type, query.type) : undefined,
        query.read === "read" ? isNotNull(notification.readAt) : undefined,
        query.read === "unread" ? isNull(notification.readAt) : undefined,
        keyword
          ? or(
              ilike(notification.title, `%${keyword}%`),
              ilike(notification.description, `%${keyword}%`),
            )
          : undefined,
      )
      const [[totalRow], [unreadTotalRow]] = await Promise.all([
        db.select({ value: count() }).from(notification).where(where),
        db
          .select({ value: count() })
          .from(notification)
          .where(and(ownerWhere, isNull(notification.readAt))),
      ])
      const items = await db
        .select()
        .from(notification)
        .where(where)
        .orderBy(desc(notification.createdAt))
        .limit(pageSize)
        .offset(offset)

      return {
        ...paginated(items, totalRow?.value ?? 0, page, pageSize),
        unreadTotal: unreadTotalRow?.value ?? 0,
      }
    },
    { auth: true, query: notificationsQuery },
  )
  .post(
    "/:id/read",
    async ({ params, user: currentUser }) => {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notification.id, params.id),
            or(eq(notification.userId, currentUser.id), isNull(notification.userId)),
          ),
        )

      return { ok: true }
    },
    { auth: true },
  )
  .post(
    "/read-all",
    async ({ user: currentUser }) => {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(or(eq(notification.userId, currentUser.id), isNull(notification.userId)))

      return { ok: true }
    },
    { auth: true },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser }) => {
      await db
        .delete(notification)
        .where(
          and(
            eq(notification.id, params.id),
            or(eq(notification.userId, currentUser.id), isNull(notification.userId)),
          ),
        )

      return { ok: true }
    },
    { auth: true },
  )
