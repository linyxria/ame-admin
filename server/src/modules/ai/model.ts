import { t } from "elysia"

export const chatBody = t.Object({
  messages: t.Array(
    t.Object({
      role: t.Union([t.Literal("user"), t.Literal("assistant")]),
      content: t.String({ minLength: 1 }),
    }),
    { minItems: 1 },
  ),
})

export type ChatBody = typeof chatBody.static

export const aiModels = {
  "Ai.ChatBody": chatBody,
}
