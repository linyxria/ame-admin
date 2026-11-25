import type { ChatModelRunResult } from "@assistant-ui/react"

function incompleteReply(message: string): ChatModelRunResult {
  return { content: [], status: { type: "incomplete", reason: "error", error: message } }
}

export async function* readChatStream(
  stream: unknown,
  onProvider: (meta: { provider: string; model: string }) => void,
  { fallback, emptyReply }: { fallback: string; emptyReply: string },
): AsyncGenerator<ChatModelRunResult> {
  if (!stream || typeof stream !== "object" || !(Symbol.asyncIterator in stream)) {
    throw new Error(fallback)
  }

  let text = ""
  let hasText = false
  for await (const chunk of stream as AsyncIterable<unknown>) {
    if (!chunk || typeof chunk !== "object" || !("event" in chunk)) continue
    if (chunk.event === "done") {
      if (!hasText) yield incompleteReply(emptyReply)
      return
    }
    const data = "data" in chunk && chunk.data
    if (!data || typeof data !== "object") continue

    switch (chunk.event) {
      case "meta":
        if (
          "provider" in data &&
          typeof data.provider === "string" &&
          "model" in data &&
          typeof data.model === "string"
        ) {
          onProvider({ provider: data.provider, model: data.model })
        }
        break
      case "delta":
        if ("content" in data && typeof data.content === "string") {
          text += data.content
          hasText ||= data.content.trim().length > 0
          if (hasText) yield { content: [{ type: "text", text }] }
        }
        break
      case "error": {
        const message =
          "message" in data && typeof data.message === "string" ? data.message : fallback
        if ("reason" in data && data.reason === "refusal") {
          yield incompleteReply(message)
          return
        }
        throw new Error(message)
      }
    }
  }

  throw new Error(fallback)
}
