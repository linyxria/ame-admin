import { eq } from "drizzle-orm"
import { db } from "@/db"
import { userRole } from "@/db/schema"

export async function assignUserRoles(userId: string, roleIds: string[] = []) {
  await db.delete(userRole).where(eq(userRole.userId, userId))

  if (roleIds.length > 0) {
    await db.insert(userRole).values(roleIds.map((roleId) => ({ userId, roleId })))
  }
}
