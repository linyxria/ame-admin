import { hashPassword } from "better-auth/crypto"
import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm"
import { db } from "@/db"
import { account, role, session, user, userRole } from "@/db/schema"
import { createAuth } from "@/lib/auth"
import { paginated, parsePagination } from "@/lib/pagination"
import type { AuditActor } from "../audit-log/service"
import { writeAuditLog } from "../audit-log/service"
import { createNotification } from "../notification/service"
import { getPasswordMinLength } from "../setting/service"
import type { CreateUserBody, ResetPasswordBody, UpdateUserBody, UsersQuery } from "./model"

export async function assignUserRoles(userId: string, roleIds: string[] = []) {
  await db.delete(userRole).where(eq(userRole.userId, userId))

  if (roleIds.length > 0) {
    await db.insert(userRole).values(roleIds.map((roleId) => ({ userId, roleId })))
  }
}

export async function listUsers(query: UsersQuery) {
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
}

export async function createUser(body: CreateUserBody, currentUser: AuditActor) {
  const passwordMinLength = await getPasswordMinLength()
  if (body.password.length < passwordMinLength) {
    return { error: `密码至少 ${passwordMinLength} 位` }
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

  return { ok: true as const }
}

export async function updateUser(userId: string, body: UpdateUserBody, currentUser: AuditActor) {
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

  await db.update(user).set(values).where(eq(user.id, userId))

  if (body.roleIds) {
    await assignUserRoles(userId, body.roleIds)
  }

  await writeAuditLog({
    actor: currentUser,
    action: "update",
    resource: "user",
    resourceId: userId,
    summary: "更新用户",
    detail: body,
  })

  return { ok: true as const }
}

export async function deleteUser(userId: string, currentUser: AuditActor) {
  if (userId === currentUser.id) {
    return { error: "不能删除当前登录用户" }
  }

  const [targetUser] = await db
    .select({ builtIn: user.builtIn })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (targetUser?.builtIn) {
    return { error: "内置系统管理员不允许删除" }
  }

  await db.delete(user).where(eq(user.id, userId))
  await writeAuditLog({
    actor: currentUser,
    action: "delete",
    resource: "user",
    resourceId: userId,
    summary: "删除用户",
  })

  return { ok: true as const }
}

export async function resetUserPassword(
  userId: string,
  body: ResetPasswordBody,
  currentUser: AuditActor,
) {
  const passwordMinLength = await getPasswordMinLength()
  if (body.password.length < passwordMinLength) {
    return { error: `密码至少 ${passwordMinLength} 位` }
  }

  const [targetAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .limit(1)

  if (!targetAccount) {
    return { error: "未找到密码登录账号" }
  }

  await db
    .update(account)
    .set({ password: await hashPassword(body.password), updatedAt: new Date() })
    .where(eq(account.id, targetAccount.id))
  await db.delete(session).where(eq(session.userId, userId))
  await createNotification({
    userId,
    type: "notice",
    title: "密码已重置",
    description: "管理员已重置你的后台登录密码，请使用新密码登录。",
  })
  await writeAuditLog({
    actor: currentUser,
    action: "reset_password",
    resource: "user",
    resourceId: userId,
    summary: "重置用户密码",
  })

  return { ok: true as const }
}

export async function revokeUserSessions(userId: string, currentUser: AuditActor) {
  await db.delete(session).where(eq(session.userId, userId))
  await writeAuditLog({
    actor: currentUser,
    action: "revoke_sessions",
    resource: "user",
    resourceId: userId,
    summary: "强制用户重新登录",
  })

  return { ok: true as const }
}
