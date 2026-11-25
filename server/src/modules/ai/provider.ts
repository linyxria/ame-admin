import { type EventSourceMessage, EventSourceParserStream } from "eventsource-parser/stream"
import OpenAI from "openai"

export type AiProviderName = "openai-compatible" | "gemini" | "anthropic"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type AiProviderConfig = {
  provider: string
  apiKey?: string
  baseURL?: string
  model: string
}

export type AiProvider = {
  name: AiProviderName
  stream: (messages: ChatMessage[], signal: AbortSignal) => AsyncIterable<string>
}

const filteredResponseMessage = "The model provider filtered the response."
const outputLimitMessage = "The model reached a token limit. The response is incomplete."
const geminiFilteredFinishReasons = new Set([
  "SAFETY",
  "RECITATION",
  "BLOCKLIST",
  "PROHIBITED_CONTENT",
  "SPII",
  "ESCALATION",
])

export class AiRefusalError extends Error {
  constructor() {
    super("The model provider declined to answer.")
  }
}

export function normalizeProvider(provider: string): AiProviderName {
  if (provider === "gemini" || provider === "anthropic") {
    return provider
  }

  return "openai-compatible"
}

export function toGeminiContents(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }))
}

export function toAnthropicMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

async function* streamOpenAICompatible(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
  const response = await client.chat.completions
    .create({ model: config.model, messages, stream: true }, { signal })
    .asResponse()

  if (!response.body) throw new Error("OpenAI-compatible response has no stream.")

  let finished = false
  for await (const frame of readServerSentEvents(response.body)) {
    if (frame.data === "[DONE]") return

    const payload = readProviderPayload<OpenAI.Chat.ChatCompletionChunk>(frame, "OpenAI-compatible")
    const choice = payload.choices?.[0]
    const finishReason = choice?.finish_reason
    if (finishReason === "content_filter") throw new Error(filteredResponseMessage)

    const content = choice?.delta?.content
    if (typeof content === "string" && content) yield content
    const refusal = choice?.delta?.refusal
    if (typeof refusal === "string" && refusal) yield refusal
    if (finishReason === "length") throw new Error(outputLimitMessage)
    if (finishReason) finished = true
  }

  if (!finished) throw new Error("OpenAI-compatible stream ended before completion.")
}

async function* streamGemini(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const baseURL = config.baseURL ?? "https://generativelanguage.googleapis.com"
  const response = await fetch(
    `${baseURL}/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`,
    {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: toGeminiContents(messages) }),
    },
  )

  if (!response.ok || !response.body) {
    throw new Error(await response.text())
  }

  let finished = false
  for await (const frame of readServerSentEvents(response.body)) {
    if (frame.data === "[DONE]") return

    const payload = readProviderPayload<{
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
      promptFeedback?: { blockReason?: string; blockReasonMessage?: string }
    }>(frame, "Gemini")
    const feedback = payload.promptFeedback
    if (feedback?.blockReason && feedback.blockReason !== "BLOCK_REASON_UNSPECIFIED") {
      throw new Error(
        feedback.blockReasonMessage || `Gemini blocked the prompt (${feedback.blockReason}).`,
      )
    }
    const candidate = payload.candidates?.[0]
    const finishReason = candidate?.finishReason
    if (finishReason && finishReason !== "FINISH_REASON_UNSPECIFIED") {
      if (geminiFilteredFinishReasons.has(finishReason)) throw new Error(filteredResponseMessage)
      finished = true
    }
    const content = candidate?.content?.parts?.map((part) => part.text ?? "").join("")
    if (content) yield content
    if (finishReason === "MAX_TOKENS") throw new Error(outputLimitMessage)
  }

  if (!finished) throw new Error("Gemini stream ended before completion.")
}

async function* streamAnthropic(
  config: AiProviderConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const baseURL = config.baseURL ?? "https://api.anthropic.com"
  const response = await fetch(`${baseURL}/v1/messages`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      messages: toAnthropicMessages(messages),
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(await response.text())
  }

  for await (const frame of readServerSentEvents(response.body)) {
    const payload = readProviderPayload<{
      type?: string
      delta?: { text?: unknown; stop_reason?: string }
    }>(frame, "Anthropic")

    if (payload.type === "message_stop") return
    if (payload.type === "message_delta") {
      const stopReason = payload.delta?.stop_reason
      if (stopReason === "refusal") throw new AiRefusalError()
      if (stopReason === "max_tokens" || stopReason === "model_context_window_exceeded") {
        throw new Error(outputLimitMessage)
      }
    }
    const text = payload.delta?.text
    if (payload.type === "content_block_delta" && typeof text === "string" && text) yield text
  }

  throw new Error("Anthropic stream ended before message_stop.")
}

function readServerSentEvents(body: ReadableStream<BufferSource>) {
  return body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream())
}

function readProviderPayload<T>(frame: EventSourceMessage, provider: string): T {
  const payload = JSON.parse(frame.data) as T & {
    type?: string
    error?: { message?: unknown }
    message?: unknown
  }
  if (!payload || typeof payload !== "object") {
    throw new Error(`${provider} stream sent an invalid event.`)
  }
  if (frame.event === "error" || payload.type === "error" || payload.error) {
    const nestedMessage = payload.error?.message
    const message =
      typeof nestedMessage === "string" && nestedMessage ? nestedMessage : payload.message
    throw new Error(typeof message === "string" && message ? message : `${provider} stream failed.`)
  }
  return payload
}

export function createAiProvider(config: AiProviderConfig): AiProvider {
  const provider = normalizeProvider(config.provider)

  if (provider === "gemini") {
    return { name: provider, stream: (messages, signal) => streamGemini(config, messages, signal) }
  }

  if (provider === "anthropic") {
    return {
      name: provider,
      stream: (messages, signal) => streamAnthropic(config, messages, signal),
    }
  }

  return {
    name: provider,
    stream: (messages, signal) => streamOpenAICompatible(config, messages, signal),
  }
}
