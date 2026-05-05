import { asc } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { systemSetting } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { writeAuditLog } from "../audit-log/service"
import { systemPermissionMacro } from "../rbac/service"
import { settingsBody } from "./model"

export const settingRoutes = new Elysia({ name: "system.settings", prefix: "/settings" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async () => {
      return db.select().from(systemSetting).orderBy(asc(systemSetting.key))
    },
    { auth: true },
  )
  .put(
    "/",
    async ({ body, user: currentUser }) => {
      for (const item of body.items) {
        await db
          .insert(systemSetting)
          .values({
            key: item.key,
            value: item.value,
            description: item.description ?? null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: systemSetting.key,
            set: {
              value: item.value,
              description: item.description ?? null,
              updatedAt: new Date(),
            },
          })
      }

      await writeAuditLog({
        actor: currentUser,
        action: "update",
        resource: "settings",
        summary: "更新系统设置",
        detail: body.items,
      })

      return { ok: true }
    },
    {
      auth: true,
      menu: { paths: "/system/settings", action: "update" },
      body: settingsBody,
    },
  )
