import { eq } from "drizzle-orm"
import { db } from "@/db"
import { roleMenu } from "@/db/schema"

const allActions = ["view", "create", "update", "delete"] as const

const normalizeActions = (actions?: string[]) => {
  const allowed = new Set(allActions)
  const normalized = (actions ?? ["view"]).filter((action) => allowed.has(action as never))

  return Array.from(new Set(normalized.length ? normalized : ["view"])).join(",")
}

export const assignRoleMenus = async (
  roleId: string,
  menuIds: string[] = [],
  permissions: { menuId: string; actions: string[] }[] = [],
) => {
  await db.delete(roleMenu).where(eq(roleMenu.roleId, roleId))

  const actionByMenuId = new Map(permissions.map((item) => [item.menuId, item.actions]))
  const targetMenuIds = Array.from(new Set([...menuIds, ...permissions.map((item) => item.menuId)]))

  if (targetMenuIds.length > 0) {
    await db.insert(roleMenu).values(
      targetMenuIds.map((menuId) => ({
        roleId,
        menuId,
        actions: normalizeActions(actionByMenuId.get(menuId)),
      })),
    )
  }
}
