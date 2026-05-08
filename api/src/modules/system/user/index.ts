import { hashPassword } from "better-auth/crypto"
import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { account, role, session, user, userRole } from "@/db/schema"
import { authMacro, createAuth } from "@/lib/auth"
import { paginated, parsePagination } from "@/lib/pagination"
import { writeAuditLog } from "../audit-log/service"
import { createNotification } from "../notification/service"
import { systemPermissionMacro } from "../rbac/service"
import { getPasswordMinLength } from "../setting/service"
import { createUserBody, resetPasswordBody, updateUserBody, usersQuery } from "./model"
import { assignUserRoles } from "./service"

export const userRoutes = new Elysia({ name: "system.users", prefix: "/users" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .get(
    "/",
    async ({ query }) => {
      const { page, pageSize, offset } = parsePagination(query)
      const keyword = query.keyword?.trim()
      const where = keyword
        ? or(ilike(user.name, `%${keyword}%`), ilike(user.email, `%${keyword}%`))
        : undefined
      const [totalRow] = await db.select({ value: count() }).from(user).where(where)
      const userRows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          enabled: user.enabled,
          builtIn: user.builtIn,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(where)
        .orderBy(asc(user.createdAt))
        .limit(pageSize)
        .offset(offset)

      const roleRows = userRows.length
        ? await db
            .select({
              userId: userRole.userId,
              roleId: role.id,
              roleName: role.name,
              roleCode: role.code,
            })
            .from(userRole)
            .innerJoin(role, eq(role.id, userRole.roleId))
            .where(
              inArray(
                userRole.userId,
                userRows.map((item) => item.id),
              ),
            )
        : []

      const rolesByUser = new Map<string, { id: string; name: string; code: string }[]>()

      for (const row of roleRows) {
        const roles = rolesByUser.get(row.userId) ?? []
        roles.push({ id: row.roleId, name: row.roleName, code: row.roleCode })
        rolesByUser.set(row.userId, roles)
      }

      return paginated(
        userRows.map((item) => ({ ...item, roles: rolesByUser.get(item.id) ?? [] })),
        totalRow?.value ?? 0,
        page,
        pageSize,
      )
    },
    { auth: true, menu: "/system/users", query: usersQuery },
  )
  .post(
    "/",
    async ({ body, user: currentUser, status }) => {
      const passwordMinLength = await getPasswordMinLength()
      if (body.password.length < passwordMinLength) {
        return status(400, { message: `密码至少 ${passwordMinLength} 位` })
      }

      const authInstance = createAuth({ disableSignUp: false })

      await authInstance.api.signUpEmail({
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
        await createNotification({
          userId: created.id,
          type: "notice",
          title: "账号已创建",
          description: "管理员已经为你创建后台账号。",
        })
      }

      await writeAuditLog({
        actor: currentUser,
        action: "create",
        resource: "user",
        resourceId: created?.id,
        summary: `创建用户 ${body.email}`,
        detail: { name: body.name, email: body.email, roleIds: body.roleIds ?? [] },
      })

      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/users", action: "create" }, body: createUserBody },
  )
  .patch(
    "/:id",
    async ({ body, params, user: currentUser }) => {
      const values: Partial<typeof user.$inferInsert> = {
        updatedAt: new Date(),
      }

      if (body.name !== undefined) {
        values.name = body.name
      }

      if (body.email !== undefined) {
        values.email = body.email
      }

      if (body.enabled !== undefined) {
        values.enabled = body.enabled
      }

      await db.update(user).set(values).where(eq(user.id, params.id))

      if (body.roleIds) {
        await assignUserRoles(params.id, body.roleIds)
      }

      await writeAuditLog({
        actor: currentUser,
        action: "update",
        resource: "user",
        resourceId: params.id,
        summary: "更新用户",
        detail: body,
      })

      return { ok: true }
    },
    { auth: true, body: updateUserBody, menu: { paths: "/system/users", action: "update" } },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      if (params.id === currentUser.id) {
        return status(400, { message: "不能删除当前登录用户" })
      }

      const [targetUser] = await db
        .select({ builtIn: user.builtIn })
        .from(user)
        .where(eq(user.id, params.id))
        .limit(1)

      if (targetUser?.builtIn) {
        return status(400, { message: "内置系统管理员不允许删除" })
      }

      await db.delete(user).where(eq(user.id, params.id))
      await writeAuditLog({
        actor: currentUser,
        action: "delete",
        resource: "user",
        resourceId: params.id,
        summary: "删除用户",
      })
      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/users", action: "delete" } },
  )
  .post(
    "/:id/reset-password",
    async ({ body, params, user: currentUser, status }) => {
      const passwordMinLength = await getPasswordMinLength()
      if (body.password.length < passwordMinLength) {
        return status(400, { message: `密码至少 ${passwordMinLength} 位` })
      }

      const [targetAccount] = await db
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, params.id), eq(account.providerId, "credential")))
        .limit(1)

      if (!targetAccount) {
        return status(400, { message: "未找到密码登录账号" })
      }

      await db
        .update(account)
        .set({ password: await hashPassword(body.password), updatedAt: new Date() })
        .where(eq(account.id, targetAccount.id))
      await db.delete(session).where(eq(session.userId, params.id))
      await createNotification({
        userId: params.id,
        type: "notice",
        title: "密码已重置",
        description: "管理员已重置你的后台登录密码，请使用新密码登录。",
      })
      await writeAuditLog({
        actor: currentUser,
        action: "reset_password",
        resource: "user",
        resourceId: params.id,
        summary: "重置用户密码",
      })

      return { ok: true }
    },
    {
      auth: true,
      menu: { paths: "/system/users", action: "update" },
      body: resetPasswordBody,
    },
  )
  .post(
    "/:id/revoke-sessions",
    async ({ params, user: currentUser }) => {
      await db.delete(session).where(eq(session.userId, params.id))
      await writeAuditLog({
        actor: currentUser,
        action: "revoke_sessions",
        resource: "user",
        resourceId: params.id,
        summary: "强制用户重新登录",
      })

      return { ok: true }
    },
    { auth: true, menu: { paths: "/system/users", action: "update" } },
  )
