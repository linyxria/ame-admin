import { env } from "@/lib/env"
import type { ChatBody } from "./model"
import { createAiProvider } from "./provider"

const encoder = new TextEncoder()

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export function isAiConfigured() {
  return Boolean(env.AI_API_KEY)
}

export function createChatStream(body: ChatBody) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const provider = createAiProvider({
          provider: env.AI_PROVIDER,
          apiKey: env.AI_API_KEY,
          baseURL: env.AI_BASE_URL,
          model: env.AI_MODEL,
        })

        controller.enqueue(sse("meta", { provider: provider.name, model: env.AI_MODEL }))

        for await (const content of provider.stream(body.messages)) {
          controller.enqueue(sse("delta", { content }))
        }

        controller.enqueue(sse("done", {}))
      } catch (error) {
        controller.enqueue(
          sse("error", {
            message: error instanceof Error ? error.message : "AI request failed.",
          }),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
    },
  })
}
