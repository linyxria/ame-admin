import { and, asc, count, eq, inArray } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from '../db'
import { menu, role, roleMenu, user, userRole } from '../db/schema'
import { auth, authMacro, createAuth } from '../lib/auth'

const id = () => crypto.randomUUID()

const optionalText = t.Optional(t.String())
const optionalNullableText = t.Optional(t.Union([t.String(), t.Null()]))

const roleBody = t.Object({
  name: t.String({ minLength: 1 }),
  code: t.String({ minLength: 1 }),
  description: optionalNullableText,
  enabled: t.Optional(t.Boolean()),
  menuIds: t.Optional(t.Array(t.String())),
})

const menuBody = t.Object({
  parentId: optionalNullableText,
  title: t.String({ minLength: 1 }),
  path: t.String({ minLength: 1 }),
  icon: optionalNullableText,
  sort: t.Optional(t.Number()),
  visible: t.Optional(t.Boolean()),
})

const assignRoleMenus = async (roleId: string, menuIds: string[] = []) => {
  await db.delete(roleMenu).where(eq(roleMenu.roleId, roleId))

  if (menuIds.length > 0) {
    await db.insert(roleMenu).values(menuIds.map((menuId) => ({ roleId, menuId })))
  }
}

const assignUserRoles = async (userId: string, roleIds: string[] = []) => {
  await db.delete(userRole).where(eq(userRole.userId, userId))

  if (roleIds.length > 0) {
    await db.insert(userRole).values(roleIds.map((roleId) => ({ userId, roleId })))
  }
}

const canAccessMenu = async (userId: string, path: string) => {
  const [allowed] = await db
    .select({ id: menu.id })
    .from(userRole)
    .innerJoin(roleMenu, eq(roleMenu.roleId, userRole.roleId))
    .innerJoin(menu, eq(menu.id, roleMenu.menuId))
    .where(and(eq(userRole.userId, userId), eq(menu.path, path), eq(menu.visible, true)))
    .limit(1)

  return Boolean(allowed)
}

const systemPermissionMacro = new Elysia({ name: 'system-permission' }).macro({
  menu: (paths: string | string[]) => ({
    async beforeHandle({ headers, status }) {
      const session = await auth.api.getSession({
        headers: new Headers(
          Object.entries(headers).filter((entry): entry is [string, string] => Boolean(entry[1])),
        ),
      })

      if (!session) {
        return status(401, { message: 'Unauthorized' })
      }

      const candidates = Array.isArray(paths) ? paths : [paths]
      const allowed = await Promise.any(
        candidates.map(async (path) => {
          if (await canAccessMenu(session.user.id, path)) {
            return true
          }

          throw new Error('Menu not allowed')
        }),
      ).catch(() => false)

      if (!allowed) {
        return status(403, { message: 'Forbidden' })
      }
    },
  }),
})

export const systemRoutes = new Elysia({ prefix: '/admin' })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    '/overview',
    async () => {
      const [users, roles, menus] = await Promise.all([
        db.select({ value: count() }).from(user),
        db.select({ value: count() }).from(role),
        db.select({ value: count() }).from(menu),
      ])

      return {
        users: users[0]?.value ?? 0,
        roles: roles[0]?.value ?? 0,
        menus: menus[0]?.value ?? 0,
      }
    },
    { auth: true },
  )
  .get(
    '/users',
    async () => {
      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          builtIn: user.builtIn,
          createdAt: user.createdAt,
          roleId: role.id,
          roleName: role.name,
          roleCode: role.code,
        })
        .from(user)
        .leftJoin(userRole, eq(userRole.userId, user.id))
        .leftJoin(role, eq(role.id, userRole.roleId))
        .orderBy(asc(user.createdAt))

      const users = new Map<
        string,
        (typeof rows)[number] & { roles: { id: string; name: string; code: string }[] }
      >()

      for (const row of rows) {
        const current =
          users.get(row.id) ??
          ({
            ...row,
            roles: [],
          } as (typeof rows)[number] & { roles: { id: string; name: string; code: string }[] })

        if (row.roleId && row.roleName && row.roleCode) {
          current.roles.push({ id: row.roleId, name: row.roleName, code: row.roleCode })
        }

        users.set(row.id, current)
      }

      return Array.from(users.values()).map(
        ({ roleId: _roleId, roleName: _roleName, roleCode: _roleCode, ...item }) => item,
      )
    },
    { auth: true, menu: '/system/users' },
  )
  .post(
    '/users',
    async ({ body }) => {
      const auth = createAuth({ disableSignUp: false })

      await auth.api.signUpEmail({
        body: {
          name: body.name,
          email: body.email,
          password: body.password,
          rememberMe: false,
        },
      })

      const [created] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, body.email))
        .limit(1)

      if (created) {
        await assignUserRoles(created.id, body.roleIds)
      }

      return { ok: true }
    },
    {
      auth: true,
      menu: '/system/users',
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        roleIds: t.Optional(t.Array(t.String())),
      }),
    },
  )
  .patch(
    '/users/:id',
    async ({ body, params }) => {
      const values: Partial<typeof user.$inferInsert> = {
        updatedAt: new Date(),
      }

      if (body.name !== undefined) {
        values.name = body.name
      }

      if (body.email !== undefined) {
        values.email = body.email
      }

      await db.update(user).set(values).where(eq(user.id, params.id))

      if (body.roleIds) {
        await assignUserRoles(params.id, body.roleIds)
      }

      return { ok: true }
    },
    {
      auth: true,
      body: t.Object({
        name: optionalText,
        email: t.Optional(t.String({ format: 'email' })),
        roleIds: t.Optional(t.Array(t.String())),
      }),
      menu: '/system/users',
    },
  )
  .delete(
    '/users/:id',
    async ({ params, user: currentUser, status }) => {
      if (params.id === currentUser.id) {
        return status(400, { message: '不能删除当前登录用户' })
      }

      const [targetUser] = await db
        .select({ builtIn: user.builtIn })
        .from(user)
        .where(eq(user.id, params.id))
        .limit(1)

      if (targetUser?.builtIn) {
        return status(400, { message: '内置系统管理员不允许删除' })
      }

      await db.delete(user).where(eq(user.id, params.id))
      return { ok: true }
    },
    { auth: true, menu: '/system/users' },
  )
  .get(
    '/roles',
    async () => {
      const roles = await db.select().from(role).orderBy(asc(role.createdAt))
      const mappings = await db.select().from(roleMenu)

      return roles.map((item) => ({
        ...item,
        menuIds: mappings
          .filter((mapping) => mapping.roleId === item.id)
          .map((mapping) => mapping.menuId),
      }))
    },
    { auth: true, menu: ['/system/roles', '/system/users'] },
  )
  .post(
    '/roles',
    async ({ body }) => {
      const roleId = id()

      await db.insert(role).values({
        id: roleId,
        name: body.name,
        code: body.code,
        description: body.description ?? null,
        enabled: body.enabled ?? true,
      })
      await assignRoleMenus(roleId, body.menuIds)

      return { ok: true, id: roleId }
    },
    { auth: true, menu: '/system/roles', body: roleBody },
  )
  .patch(
    '/roles/:id',
    async ({ body, params }) => {
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

      await assignRoleMenus(params.id, body.menuIds)

      return { ok: true }
    },
    { auth: true, menu: '/system/roles', body: roleBody },
  )
  .delete(
    '/roles/:id',
    async ({ params, status }) => {
      const [targetRole] = await db
        .select({ builtIn: role.builtIn })
        .from(role)
        .where(eq(role.id, params.id))
        .limit(1)

      if (targetRole?.builtIn) {
        return status(400, { message: '内置超级管理员角色不允许删除' })
      }

      const [used] = await db
        .select({ value: count() })
        .from(userRole)
        .where(eq(userRole.roleId, params.id))

      if ((used?.value ?? 0) > 0) {
        return status(400, { message: '角色已分配给用户，无法删除' })
      }

      await db.delete(role).where(eq(role.id, params.id))
      return { ok: true }
    },
    { auth: true, menu: '/system/roles' },
  )
  .get(
    '/menus',
    async () => {
      return db.select().from(menu).orderBy(asc(menu.sort), asc(menu.createdAt))
    },
    { auth: true, menu: ['/system/menus', '/system/roles'] },
  )
  .get(
    '/my-menus',
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
  .post(
    '/menus',
    async ({ body }) => {
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

      return { ok: true, id: menuId }
    },
    { auth: true, menu: '/system/menus', body: menuBody },
  )
  .patch(
    '/menus/:id',
    async ({ body, params }) => {
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

      return { ok: true }
    },
    { auth: true, menu: '/system/menus', body: menuBody },
  )
  .delete(
    '/menus/:id',
    async ({ params, status }) => {
      const [targetMenu] = await db
        .select({ builtIn: menu.builtIn })
        .from(menu)
        .where(eq(menu.id, params.id))
        .limit(1)

      if (targetMenu?.builtIn) {
        return status(400, { message: '核心系统菜单不允许删除' })
      }

      const [children] = await db
        .select({ value: count() })
        .from(menu)
        .where(eq(menu.parentId, params.id))

      if ((children?.value ?? 0) > 0) {
        return status(400, { message: '请先删除子菜单' })
      }

      await db.delete(menu).where(eq(menu.id, params.id))
      return { ok: true }
    },
    { auth: true, menu: '/system/menus' },
  )
