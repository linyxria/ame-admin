import { eq } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { user } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { writeAuditLog } from "../audit-log/service"
import { profileBody } from "./model"

export const profileRoutes = new Elysia({ name: "system.profile", prefix: "/profile" })
  .use(authMacro)
  .patch(
    "/",
    async ({ body, user: currentUser }) => {
      const [updated] = await db
        .update(user)
        .set({
          name: body.name,
          image: body.image ?? null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, currentUser.id))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })

      await writeAuditLog({
        actor: currentUser,
        action: "update",
        resource: "profile",
        resourceId: currentUser.id,
        summary: "更新个人资料",
        detail: body,
      })

      return updated
    },
    { auth: true, body: profileBody },
  )
