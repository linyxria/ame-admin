import { and, eq } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { menu, role, roleMenu, userRole } from "@/db/schema"
import { auth } from "@/lib/auth"

export function splitActions(actions: string) {
  return actions.split(",").filter(Boolean)
}

async function canAccessMenu(userId: string, path: string, action = "view") {
  const [allowed] = await db
    .select({ id: menu.id, actions: roleMenu.actions })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .innerJoin(roleMenu, eq(roleMenu.roleId, role.id))
    .innerJoin(menu, eq(menu.id, roleMenu.menuId))
    .where(
      and(
        eq(userRole.userId, userId),
        eq(role.enabled, true),
        eq(menu.path, path),
        eq(menu.visible, true),
      ),
    )
    .limit(1)

  return Boolean(allowed && splitActions(allowed.actions).includes(action))
}

export const systemPermissionMacro = new Elysia({ name: "system-permission" }).macro({
  menu: (options: string | string[] | { paths: string | string[]; action?: string }) => ({
    async beforeHandle({ headers, status }) {
      const session = await auth.api.getSession({
        headers: new Headers(
          Object.entries(headers).filter((entry): entry is [string, string] => Boolean(entry[1])),
        ),
      })

      if (!session) {
        return status(401, { message: "Unauthorized" })
      }

      const paths = typeof options === "object" && !Array.isArray(options) ? options.paths : options
      const action =
        typeof options === "object" && !Array.isArray(options) ? options.action : "view"
      const candidates = Array.isArray(paths) ? paths : [paths]
      const allowed = await Promise.any(
        candidates.map(async (path) => {
          if (await canAccessMenu(session.user.id, path, action ?? "view")) {
            return true
          }

          throw new Error("Menu not allowed")
        }),
      ).catch(() => false)

      if (!allowed) {
        return status(403, { message: "Forbidden" })
      }
    },
  }),
})
