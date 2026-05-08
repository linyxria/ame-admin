import { t } from "elysia"
import { optionalNullableText } from "@/lib/model"

export const menuBody = t.Object({
  parentId: optionalNullableText,
  title: t.String({ minLength: 1 }),
  path: t.String({ minLength: 1 }),
  icon: optionalNullableText,
  sort: t.Optional(t.Number()),
  visible: t.Optional(t.Boolean()),
})
