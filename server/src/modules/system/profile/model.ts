import { t } from "elysia"
import { optionalNullableText } from "@/lib/model"

export const profileBody = t.Object({
  name: t.String({ minLength: 1 }),
  image: optionalNullableText,
})

export type ProfileBody = typeof profileBody.static

export const profileModels = {
  "System.ProfileBody": profileBody,
}
