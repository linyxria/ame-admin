import { t } from "elysia"
import { optionalText } from "@/lib/model"

export const createUserBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  roleIds: t.Optional(t.Array(t.String())),
})

export const updateUserBody = t.Object({
  name: optionalText,
  email: t.Optional(t.String({ format: "email" })),
  enabled: t.Optional(t.Boolean()),
  roleIds: t.Optional(t.Array(t.String())),
})

export const resetPasswordBody = t.Object({
  password: t.String({ minLength: 8 }),
})
