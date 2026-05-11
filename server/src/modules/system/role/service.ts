import { asc, count, eq } from "drizzle-orm"
import { db } from "@/db"
import { role, roleMenu, userRole } from "@/db/schema"
import { id } from "@/lib/id"
import type { AuditActor } from "../audit-log/service"
import { writeAuditLog } from "../audit-log/service"
import { splitActions } from "../rbac/service"
import type { RoleBody } from "./model"

const allActions = ["view", "create", "update", "delete"] as const

function normalizeActions(actions?: string[]) {
  const allowed = new Set(allActions)
  const normalized = (actions ?? ["view"]).filter((action) => allowed.has(action as never))

  return Array.from(new Set(normalized.length ? normalized : ["view"])).join(",")
}

export async function assignRoleMenus(
  roleId: string,
  menuIds: string[] = [],
  permissions: { menuId: string; actions: string[] }[] = [],
) {
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

export async function listRoles() {
  const roles = await db.select().from(role).orderBy(asc(role.createdAt))
  const mappings = await db.select().from(roleMenu)

  return roles.map((item) => ({
    ...item,
    menuIds: mappings
      .filter((mapping) => mapping.roleId === item.id)
      .map((mapping) => mapping.menuId),
    permissions: mappings
      .filter((mapping) => mapping.roleId === item.id)
      .map((mapping) => ({
        menuId: mapping.menuId,
        actions: splitActions(mapping.actions),
      })),
  }))
}

export async function createRole(body: RoleBody, currentUser: AuditActor) {
  const roleId = id()

  await db.insert(role).values({
    id: roleId,
    name: body.name,
    code: body.code,
    description: body.description ?? null,
    enabled: body.enabled ?? true,
  })
  await assignRoleMenus(roleId, body.menuIds, body.permissions)
  await writeAuditLog({
    actor: currentUser,
    action: "create",
    resource: "role",
    resourceId: roleId,
    summary: `创建角色 ${body.name}`,
    detail: body,
  })

  return { ok: true as const, id: roleId }
}

export async function updateRole(roleId: string, body: RoleBody, currentUser: AuditActor) {
  await db
    .update(role)
    .set({
      name: body.name,
      code: body.code,
      description: body.description ?? null,
      enabled: body.enabled ?? true,
      updatedAt: new Date(),
    })
    .where(eq(role.id, roleId))

  await assignRoleMenus(roleId, body.menuIds, body.permissions)
  await writeAuditLog({
    actor: currentUser,
    action: "update",
    resource: "role",
    resourceId: roleId,
    summary: `更新角色 ${body.name}`,
    detail: body,
  })

  return { ok: true as const }
}

export async function deleteRole(roleId: string, currentUser: AuditActor) {
  const [targetRole] = await db
    .select({ builtIn: role.builtIn })
    .from(role)
    .where(eq(role.id, roleId))
    .limit(1)

  if (targetRole?.builtIn) {
    return { error: "内置超级管理员角色不允许删除" }
  }

  const [used] = await db
    .select({ value: count() })
    .from(userRole)
    .where(eq(userRole.roleId, roleId))

  if ((used?.value ?? 0) > 0) {
    return { error: "角色已分配给用户，无法删除" }
  }

  await db.delete(role).where(eq(role.id, roleId))
  await writeAuditLog({
    actor: currentUser,
    action: "delete",
    resource: "role",
    resourceId: roleId,
    summary: "删除角色",
  })

  return { ok: true as const }
}
