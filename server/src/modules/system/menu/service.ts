import { and, asc, count, eq, inArray } from "drizzle-orm"
import { db } from "@/db"
import { menu, role, roleMenu, userRole } from "@/db/schema"
import { id } from "@/lib/id"
import type { AuditActor } from "../audit-log/service"
import { writeAuditLog } from "../audit-log/service"
import { splitActions } from "../rbac/service"
import type { MenuBody } from "./model"

export async function listMenus() {
  return db.select().from(menu).orderBy(asc(menu.sort), asc(menu.createdAt))
}

export async function createMenu(body: MenuBody, currentUser: AuditActor) {
  const menuId = id()

  await db.insert(menu).values({
    id: menuId,
    parentId: body.parentId ?? null,
    title: body.title,
    titleKey: body.titleKey ?? null,
    path: body.path,
    icon: body.icon ?? null,
    sort: body.sort ?? 0,
    visible: body.visible ?? true,
  })

  await writeAuditLog({
    actor: currentUser,
    action: "create",
    resource: "menu",
    resourceId: menuId,
    summary: `创建菜单 ${body.title}`,
    detail: body,
  })

  return { ok: true as const, id: menuId }
}

export async function updateMenu(menuId: string, body: MenuBody, currentUser: AuditActor) {
  await db
    .update(menu)
    .set({
      parentId: body.parentId ?? null,
      title: body.title,
      ...("titleKey" in body ? { titleKey: body.titleKey ?? null } : {}),
      path: body.path,
      icon: body.icon ?? null,
      sort: body.sort ?? 0,
      visible: body.visible ?? true,
      updatedAt: new Date(),
    })
    .where(eq(menu.id, menuId))

  await writeAuditLog({
    actor: currentUser,
    action: "update",
    resource: "menu",
    resourceId: menuId,
    summary: `更新菜单 ${body.title}`,
    detail: body,
  })

  return { ok: true as const }
}

export async function deleteMenu(menuId: string, currentUser: AuditActor) {
  const [targetMenu] = await db
    .select({ builtIn: menu.builtIn })
    .from(menu)
    .where(eq(menu.id, menuId))
    .limit(1)

  if (targetMenu?.builtIn) {
    return { error: "核心系统菜单不允许删除" }
  }

  const [children] = await db.select({ value: count() }).from(menu).where(eq(menu.parentId, menuId))

  if ((children?.value ?? 0) > 0) {
    return { error: "请先删除子菜单" }
  }

  await db.delete(menu).where(eq(menu.id, menuId))
  await writeAuditLog({
    actor: currentUser,
    action: "delete",
    resource: "menu",
    resourceId: menuId,
    summary: "删除菜单",
  })

  return { ok: true as const }
}

export async function listCurrentUserMenus(userId: string) {
  const roleIds = await db
    .select({ roleId: userRole.roleId })
    .from(userRole)
    .where(eq(userRole.userId, userId))

  if (roleIds.length === 0) {
    return []
  }

  const menuIds = await db
    .select({ menuId: roleMenu.menuId })
    .from(roleMenu)
    .where(
      inArray(
        roleMenu.roleId,
        roleIds.map((item) => item.roleId),
      ),
    )

  if (menuIds.length === 0) {
    return []
  }

  return db
    .select()
    .from(menu)
    .where(
      and(
        eq(menu.visible, true),
        inArray(
          menu.id,
          menuIds.map((item) => item.menuId),
        ),
      ),
    )
    .orderBy(asc(menu.sort), asc(menu.createdAt))
}

export async function listCurrentUserPermissions(userId: string) {
  const rows = await db
    .select({ path: menu.path, actions: roleMenu.actions })
    .from(userRole)
    .innerJoin(role, eq(role.id, userRole.roleId))
    .innerJoin(roleMenu, eq(roleMenu.roleId, role.id))
    .innerJoin(menu, eq(menu.id, roleMenu.menuId))
    .where(and(eq(userRole.userId, userId), eq(role.enabled, true)))

  const permissions = new Map<string, Set<string>>()

  for (const row of rows) {
    const actions = permissions.get(row.path) ?? new Set<string>()
    for (const action of splitActions(row.actions)) {
      actions.add(action)
    }
    permissions.set(row.path, actions)
  }

  return Array.from(permissions.entries()).map(([path, actions]) => ({
    path,
    actions: Array.from(actions),
  }))
}
