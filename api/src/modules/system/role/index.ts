import { asc, count, eq } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { role, roleMenu, userRole } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { id } from "@/lib/id"
import { writeAuditLog } from "../audit-log/service"
import { splitActions, systemPermissionMacro } from "../rbac/service"
import { roleBody } from "./model"
import { assignRoleMenus } from "./service"

export const roleRoutes = new Elysia({ name: "system.roles", prefix: "/roles" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async () => {
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
    },
    { auth: true, menu: ["/system/roles", "/system/users"] },
  )
  .post(
    "/",
    async ({ body, user: currentUser }) => {
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

      return { ok: true, id: roleId }
    },
    { auth: true, menu: { paths: "/system/roles", action: "create" }, body: roleBody },
  )
  .patch(
    "/:id",
    async ({ body, params, user: currentUser }) => {
      await db
        .update(role)
        .set({
          name: body.name,
          code: body.code,
          description: body.description ?? null,
          enabled: body.enabled ?? true,
          updatedAt: new Date(),
        })
        .where(eq(role.id, params.id))

      await assignRoleMenus(params.id, body.menuIds, body.permissions)
      await writeAuditLog({
        actor: currentUser,
        action: "update",
        resource: "role",
        resourceId: params.id,
        summary: `更新角色 ${body.name}`,
        detail: body,
      })

      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/roles", action: "update" }, body: roleBody },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      const [targetRole] = await db
        .select({ builtIn: role.builtIn })
        .from(role)
        .where(eq(role.id, params.id))
        .limit(1)

      if (targetRole?.builtIn) {
        return status(400, { message: "内置超级管理员角色不允许删除" })
      }

      const [used] = await db
        .select({ value: count() })
        .from(userRole)
        .where(eq(userRole.roleId, params.id))

      if ((used?.value ?? 0) > 0) {
        return status(400, { message: "角色已分配给用户，无法删除" })
      }

      await db.delete(role).where(eq(role.id, params.id))
      await writeAuditLog({
        actor: currentUser,
        action: "delete",
        resource: "role",
        resourceId: params.id,
        summary: "删除角色",
      })
      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/roles", action: "delete" } },
  )
