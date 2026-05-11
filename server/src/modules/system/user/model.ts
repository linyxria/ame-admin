import { t } from "elysia"
import { optionalText } from "@/lib/model"
import { paginationQuery } from "@/lib/pagination"

export const usersQuery = t.Object({
  ...paginationQuery,
})

export type UsersQuery = typeof usersQuery.static

export const createUserBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  roleIds: t.Optional(t.Array(t.String())),
})

export type CreateUserBody = typeof createUserBody.static

export const updateUserBody = t.Object({
  name: optionalText,
  email: t.Optional(t.String({ format: "email" })),
  enabled: t.Optional(t.Boolean()),
  roleIds: t.Optional(t.Array(t.String())),
})

export type UpdateUserBody = typeof updateUserBody.static

export const resetPasswordBody = t.Object({
  password: t.String({ minLength: 8 }),
})

export type ResetPasswordBody = typeof resetPasswordBody.static

export const userModels = {
  "System.UsersQuery": usersQuery,
  "System.CreateUserBody": createUserBody,
  "System.UpdateUserBody": updateUserBody,
  "System.ResetPasswordBody": resetPasswordBody,
}
