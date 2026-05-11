import { eq } from "drizzle-orm"
import { db } from "@/db"
import { user } from "@/db/schema"
import type { AuditActor } from "../audit-log/service"
import { writeAuditLog } from "../audit-log/service"
import type { ProfileBody } from "./model"

export async function updateProfile(body: ProfileBody, currentUser: AuditActor) {
  const [updated] = await db
    .update(user)
    .set({
      name: body.name,
      image: body.image ?? null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, currentUser.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })

  await writeAuditLog({
    actor: currentUser,
    action: "update",
    resource: "profile",
    resourceId: currentUser.id,
    summary: "更新个人资料",
    detail: body,
  })

  return updated
}
