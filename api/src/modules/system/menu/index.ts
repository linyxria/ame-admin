import { and, asc, count, eq, inArray } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { menu, role, roleMenu, userRole } from "@/db/schema"
import { authMacro } from "@/lib/auth"
import { id } from "@/lib/id"
import { writeAuditLog } from "../audit-log/service"
import { splitActions, systemPermissionMacro } from "../rbac/service"
import { menuBody } from "./model"

export const menuRoutes = new Elysia({ name: "system.menus", prefix: "/menus" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async () => {
      return db.select().from(menu).orderBy(asc(menu.sort), asc(menu.createdAt))
    },
    { auth: true, menu: ["/system/menus", "/system/roles"] },
  )
  .post(
    "/",
    async ({ body, user: currentUser }) => {
      const menuId = id()

      await db.insert(menu).values({
        id: menuId,
        parentId: body.parentId ?? null,
        title: body.title,
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

      return { ok: true, id: menuId }
    },
    { auth: true, menu: { paths: "/system/menus", action: "create" }, body: menuBody },
  )
  .patch(
    "/:id",
    async ({ body, params, user: currentUser }) => {
      await db
        .update(menu)
        .set({
          parentId: body.parentId ?? null,
          title: body.title,
          path: body.path,
          icon: body.icon ?? null,
          sort: body.sort ?? 0,
          visible: body.visible ?? true,
          updatedAt: new Date(),
        })
        .where(eq(menu.id, params.id))

      await writeAuditLog({
        actor: currentUser,
        action: "update",
        resource: "menu",
        resourceId: params.id,
        summary: `更新菜单 ${body.title}`,
        detail: body,
      })

      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/menus", action: "update" }, body: menuBody },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      const [targetMenu] = await db
        .select({ builtIn: menu.builtIn })
        .from(menu)
        .where(eq(menu.id, params.id))
        .limit(1)

      if (targetMenu?.builtIn) {
        return status(400, { message: "核心系统菜单不允许删除" })
      }

      const [children] = await db
        .select({ value: count() })
        .from(menu)
        .where(eq(menu.parentId, params.id))

      if ((children?.value ?? 0) > 0) {
        return status(400, { message: "请先删除子菜单" })
      }

      await db.delete(menu).where(eq(menu.id, params.id))
      await writeAuditLog({
        actor: currentUser,
        action: "delete",
        resource: "menu",
        resourceId: params.id,
        summary: "删除菜单",
      })
      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/menus", action: "delete" } },
  )

export const myMenuRoutes = new Elysia({ name: "system.my-menus" })
  .use(authMacro)
  .get(
    "/my-menus",
    async ({ user: currentUser }) => {
      const roleIds = await db
        .select({ roleId: userRole.roleId })
        .from(userRole)
        .where(eq(userRole.userId, currentUser.id))

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
    },
    { auth: true },
  )
  .get(
    "/my-permissions",
    async ({ user: currentUser }) => {
      const rows = await db
        .select({ path: menu.path, actions: roleMenu.actions })
        .from(userRole)
        .innerJoin(role, eq(role.id, userRole.roleId))
        .innerJoin(roleMenu, eq(roleMenu.roleId, role.id))
        .innerJoin(menu, eq(menu.id, roleMenu.menuId))
        .where(and(eq(userRole.userId, currentUser.id), eq(role.enabled, true)))

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
    },
    { auth: true },
  )
