import { and, count, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm"
import { db } from "@/db"
import { notification } from "@/db/schema"
import { id } from "@/lib/id"
import { paginated, parsePagination } from "@/lib/pagination"
import type { AuditActor } from "../audit-log/service"

export async function createNotification({
  userId,
  type,
  title,
  description,
}: {
  userId?: string | null
  type: string
  title: string
  description?: string | null
}) {
  await db.insert(notification).values({
    id: id(),
    userId: userId ?? null,
    type,
    title,
    description: description ?? null,
  })
}

type NotificationsQuery = {
  page?: string
  pageSize?: string
  keyword?: string
  type?: string
  read?: string
}

function notificationOwnerWhere(userId: string) {
  return or(eq(notification.userId, userId), isNull(notification.userId))
}

export async function listNotifications(query: NotificationsQuery, currentUser: AuditActor) {
  const { page, pageSize, offset } = parsePagination(query)
  const keyword = query.keyword?.trim()
  const ownerWhere = notificationOwnerWhere(currentUser.id)
  const where = and(
    ownerWhere,
    query.type ? eq(notification.type, query.type) : undefined,
    query.read === "read" ? isNotNull(notification.readAt) : undefined,
    query.read === "unread" ? isNull(notification.readAt) : undefined,
    keyword
      ? or(
          ilike(notification.title, `%${keyword}%`),
          ilike(notification.description, `%${keyword}%`),
        )
      : undefined,
  )
  const [[totalRow], [unreadTotalRow]] = await Promise.all([
    db.select({ value: count() }).from(notification).where(where),
    db
      .select({ value: count() })
      .from(notification)
      .where(and(ownerWhere, isNull(notification.readAt))),
  ])
  const items = await db
    .select()
    .from(notification)
    .where(where)
    .orderBy(desc(notification.createdAt))
    .limit(pageSize)
    .offset(offset)

  return {
    ...paginated(items, totalRow?.value ?? 0, page, pageSize),
    unreadTotal: unreadTotalRow?.value ?? 0,
  }
}

export async function markNotificationRead(id: string, currentUser: AuditActor) {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, id), notificationOwnerWhere(currentUser.id)))

  return { ok: true as const }
}

export async function markAllNotificationsRead(currentUser: AuditActor) {
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(notificationOwnerWhere(currentUser.id))

  return { ok: true as const }
}

export async function deleteNotification(id: string, currentUser: AuditActor) {
  await db
    .delete(notification)
    .where(and(eq(notification.id, id), notificationOwnerWhere(currentUser.id)))

  return { ok: true as const }
}
