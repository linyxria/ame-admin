import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { systemSetting } from "@/db/schema"
import type { AuditActor } from "../audit-log/service"
import { writeAuditLog } from "../audit-log/service"
import type { SettingsBody } from "./model"

export async function getSystemSetting(key: string) {
  const [item] = await db
    .select({ value: systemSetting.value })
    .from(systemSetting)
    .where(eq(systemSetting.key, key))
    .limit(1)

  return item?.value
}

export async function getPasswordMinLength() {
  const value = Number.parseInt((await getSystemSetting("passwordMinLength")) ?? "", 10)

  return Number.isFinite(value) && value >= 8 ? value : 8
}

export async function isPublicSignUpAllowed() {
  return (await getSystemSetting("allowPublicSignUp")) === "true"
}

export async function listSettings() {
  return db.select().from(systemSetting).orderBy(asc(systemSetting.key))
}

export async function updateSettings(body: SettingsBody, currentUser: AuditActor) {
  for (const item of body.items) {
    await db
      .insert(systemSetting)
      .values({
        key: item.key,
        value: item.value,
        description: item.description ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSetting.key,
        set: {
          value: item.value,
          description: item.description ?? null,
          updatedAt: new Date(),
        },
      })
  }

  await writeAuditLog({
    actor: currentUser,
    action: "update",
    resource: "settings",
    summary: "更新系统设置",
    detail: body.items,
  })

  return { ok: true as const }
}
