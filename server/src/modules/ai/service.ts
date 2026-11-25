import { env } from "@/lib/env"
import type { ChatBody } from "./model"
import { AiRefusalError, createAiProvider } from "./provider"

const encoder = new TextEncoder()

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export function isAiConfigured() {
  return Boolean(env.AI_API_KEY)
}

export function createChatStream(body: ChatBody, requestSignal: AbortSignal) {
  const cancelled = new AbortController()
  const signal = AbortSignal.any([requestSignal, cancelled.signal])
  const stream = new ReadableStream({
    async start(controller) {
      try {
        signal.throwIfAborted()
        const provider = createAiProvider({
          provider: env.AI_PROVIDER,
          apiKey: env.AI_API_KEY,
          baseURL: env.AI_BASE_URL,
          model: env.AI_MODEL,
        })

        controller.enqueue(sse("meta", { provider: provider.name, model: env.AI_MODEL }))

        for await (const content of provider.stream(body.messages, signal)) {
          signal.throwIfAborted()
          controller.enqueue(sse("delta", { content }))
        }

        signal.throwIfAborted()
        controller.enqueue(sse("done", {}))
      } catch (error) {
        if (!signal.aborted) {
          controller.enqueue(
            sse("error", {
              message: error instanceof Error ? error.message : "AI request failed.",
              reason: error instanceof AiRefusalError ? "refusal" : undefined,
            }),
          )
        }
      } finally {
        if (!cancelled.signal.aborted) controller.close()
      }
    },
    cancel(reason) {
      cancelled.abort(reason)
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
