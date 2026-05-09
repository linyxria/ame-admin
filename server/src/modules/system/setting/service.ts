import { eq } from "drizzle-orm"
import { db } from "@/db"
import { systemSetting } from "@/db/schema"

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
