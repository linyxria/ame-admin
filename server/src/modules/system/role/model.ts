import { t } from "elysia"
import { optionalNullableText } from "@/lib/model"

export const roleBody = t.Object({
  name: t.String({ minLength: 1 }),
  code: t.String({ minLength: 1 }),
  description: optionalNullableText,
  enabled: t.Optional(t.Boolean()),
  menuIds: t.Optional(t.Array(t.String())),
  permissions: t.Optional(
    t.Array(
      t.Object({
        menuId: t.String(),
        actions: t.Array(t.String()),
      }),
    ),
  ),
})
