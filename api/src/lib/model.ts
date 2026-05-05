import { t } from "elysia"

export const optionalText = t.Optional(t.String())
export const optionalNullableText = t.Optional(t.Union([t.String(), t.Null()]))
