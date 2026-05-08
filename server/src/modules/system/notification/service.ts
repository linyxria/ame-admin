import { db } from "@/db"
import { notification } from "@/db/schema"
import { id } from "@/lib/id"

export const createNotification = async ({
  userId,
  type,
  title,
  description,
}: {
  userId?: string | null
  type: string
  title: string
  description?: string | null
}) => {
  await db.insert(notification).values({
    id: id(),
    userId: userId ?? null,
    type,
    title,
    description: description ?? null,
  })
}
