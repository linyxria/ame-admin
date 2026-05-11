import { t } from "elysia"
import { optionalNullableText } from "@/lib/model"

export const settingsBody = t.Object({
  items: t.Array(
    t.Object({
      key: t.String({ minLength: 1 }),
      value: t.String(),
      description: optionalNullableText,
    }),
  ),
})

export type SettingsBody = typeof settingsBody.static

export const settingModels = {
  "System.SettingsBody": settingsBody,
}
