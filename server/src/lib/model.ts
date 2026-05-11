import { t } from "elysia"

export const idParams = t.Object({
  id: t.String({ minLength: 1 }),
})

export type IdParams = typeof idParams.static

export const okResponse = t.Object({
  ok: t.Literal(true),
})

export type OkResponse = typeof okResponse.static

export const optionalText = t.Optional(t.String())
export const optionalNullableText = t.Optional(t.Union([t.String(), t.Null()]))
