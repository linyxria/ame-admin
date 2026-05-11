import { count, desc, ilike, or } from "drizzle-orm"
import { db } from "@/db"
import { auditLog } from "@/db/schema"
import { id } from "@/lib/id"
import { paginated, parsePagination } from "@/lib/pagination"

export type AuditActor = {
  id: string
  name?: string | null
  email: string
}

export async function writeAuditLog({
  actor,
  action,
  resource,
  resourceId,
  summary,
  detail,
}: {
  actor: AuditActor
  action: string
  resource: string
  resourceId?: string | null
  summary: string
  detail?: unknown
}) {
  await db.insert(auditLog).values({
    id: id(),
    actorId: actor.id,
    actorName: actor.name ?? null,
    actorEmail: actor.email,
    action,
    resource,
    resourceId: resourceId ?? null,
    summary,
    detail: detail ? JSON.stringify(detail) : null,
  })
}

export async function listAuditLogs(query: { page?: string; pageSize?: string; keyword?: string }) {
  const keyword = query.keyword?.trim()
  const { page, pageSize, offset } = parsePagination(query)
  const where = keyword
    ? or(
        ilike(auditLog.summary, `%${keyword}%`),
        ilike(auditLog.actorName, `%${keyword}%`),
        ilike(auditLog.actorEmail, `%${keyword}%`),
        ilike(auditLog.resource, `%${keyword}%`),
        ilike(auditLog.action, `%${keyword}%`),
      )
    : undefined

  const [totalRow] = await db.select({ value: count() }).from(auditLog).where(where)
  const items = await db
    .select()
    .from(auditLog)
    .where(where)
    .orderBy(desc(auditLog.createdAt))
    .limit(pageSize)
    .offset(offset)

  return paginated(items, totalRow?.value ?? 0, page, pageSize)
}
