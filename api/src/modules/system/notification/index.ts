import { desc, eq, isNull, or } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { notification } from "@/db/schema"
import { authMacro } from "@/lib/auth"

export const notificationRoutes = new Elysia({
  name: "system.notifications",
  prefix: "/notifications",
})
  .use(authMacro)
  .get(
    "/",
    async ({ user: currentUser }) => {
      return db
        .select()
        .from(notification)
        .where(or(eq(notification.userId, currentUser.id), isNull(notification.userId)))
        .orderBy(desc(notification.createdAt))
        .limit(100)
    },
    { auth: true },
  )
  .post(
    "/:id/read",
    async ({ params }) => {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(eq(notification.id, params.id))

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
    async ({ params }) => {
      await db.delete(notification).where(eq(notification.id, params.id))

      return { ok: true }
    },
    { auth: true },
  )
