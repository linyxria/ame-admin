import { t } from "elysia"
import { optionalNullableText } from "@/lib/model"

export const profileBody = t.Object({
  name: t.String({ minLength: 1 }),
  image: optionalNullableText,
})
