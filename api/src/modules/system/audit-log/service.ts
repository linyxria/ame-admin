import { db } from "@/db"
import { auditLog } from "@/db/schema"
import { id } from "@/lib/id"

type AuditActor = {
  id: string
  name?: string | null
  email: string
}

export const writeAuditLog = async ({
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
}) => {
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
