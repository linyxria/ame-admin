import { and, eq } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { menu, role, roleMenu, userRole } from "@/db/schema"
import { authMacro } from "@/lib/auth"

type MenuPermissionOptions = string | string[] | { paths: string | string[]; action?: string }

export function splitActions(actions: string) {
  return actions.split(",").filter(Boolean)
}

export async function canAccessMenu(userId: string, path: string, action = "view") {
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

function normalizeMenuOptions(options: MenuPermissionOptions) {
  const paths = typeof options === "object" && !Array.isArray(options) ? options.paths : options
  const action = typeof options === "object" && !Array.isArray(options) ? options.action : "view"

  return {
    action: action ?? "view",
    candidates: Array.isArray(paths) ? paths : [paths],
  }
}

export const systemPermissionMacro = new Elysia({ name: "system-permission" })
  .use(authMacro)
  .macro("menu", (options: MenuPermissionOptions) => ({
    auth: true,
    async resolve(context) {
      const { status } = context
      const { user } = context as typeof context & { user: { id: string } }
      const { action, candidates } = normalizeMenuOptions(options)

      const allowed = await Promise.any(
        candidates.map(async (path) => {
          if (await canAccessMenu(user.id, path, action)) {
            return true
          }

          throw new Error("Menu not allowed")
        }),
      ).catch(() => false)

      if (!allowed) {
        return status(403, { message: "Forbidden" })
      }
    },
  }))
