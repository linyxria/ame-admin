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
  stream: (messages: ChatMessage[]) => AsyncIterable<string>
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

async function* streamOpenAICompatible(config: AiProviderConfig, messages: ChatMessage[]) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
  const response = await client.chat.completions.create({
    model: config.model,
    messages,
    stream: true,
  })

  for await (const event of response) {
    const content = event.choices[0]?.delta.content

    if (content) {
      yield content
    }
  }
}

async function* streamGemini(config: AiProviderConfig, messages: ChatMessage[]) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const baseURL = config.baseURL ?? "https://generativelanguage.googleapis.com"
  const response = await fetch(
    `${baseURL}/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: toGeminiContents(messages) }),
    },
  )

  if (!response.ok || !response.body) {
    throw new Error(await response.text())
  }

  yield* parseSseTextStream(response.body, (data) => {
    const payload = JSON.parse(data) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }

    return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? ""
  })
}

async function* streamAnthropic(config: AiProviderConfig, messages: ChatMessage[]) {
  if (!config.apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const baseURL = config.baseURL ?? "https://api.anthropic.com"
  const response = await fetch(`${baseURL}/v1/messages`, {
    method: "POST",
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

  yield* parseSseTextStream(response.body, (data) => {
    const payload = JSON.parse(data) as {
      type?: string
      delta?: { text?: string }
    }

    return payload.type === "content_block_delta" ? (payload.delta?.text ?? "") : ""
  })
}

async function* parseSseTextStream(
  body: ReadableStream<Uint8Array>,
  pickContent: (data: string) => string,
) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const event of events) {
      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n")

      if (!data || data === "[DONE]") {
        continue
      }

      const content = pickContent(data)

      if (content) {
        yield content
      }
    }
  }
}

export function createAiProvider(config: AiProviderConfig): AiProvider {
  const provider = normalizeProvider(config.provider)

  if (provider === "gemini") {
    return { name: provider, stream: (messages) => streamGemini(config, messages) }
  }

  if (provider === "anthropic") {
    return { name: provider, stream: (messages) => streamAnthropic(config, messages) }
  }

  return { name: provider, stream: (messages) => streamOpenAICompatible(config, messages) }
}
