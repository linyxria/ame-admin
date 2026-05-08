import { eq } from "drizzle-orm"
import { db } from "@/db"
import { systemSetting } from "@/db/schema"

export const getSystemSetting = async (key: string) => {
  const [item] = await db
    .select({ value: systemSetting.value })
    .from(systemSetting)
    .where(eq(systemSetting.key, key))
    .limit(1)

  return item?.value
}

export const getPasswordMinLength = async () => {
  const value = Number.parseInt((await getSystemSetting("passwordMinLength")) ?? "", 10)

  return Number.isFinite(value) && value >= 8 ? value : 8
}

export const isPublicSignUpAllowed = async () =>
  (await getSystemSetting("allowPublicSignUp")) === "true"
