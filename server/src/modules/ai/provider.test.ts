import { afterEach, describe, expect, it, mock, spyOn } from "bun:test"
import {
  type AiProviderName,
  AiRefusalError,
  createAiProvider,
  normalizeProvider,
  toAnthropicMessages,
  toGeminiContents,
} from "./provider"

describe("ai provider helpers", () => {
  it("normalizes provider names", () => {
    expect(normalizeProvider("gemini")).toBe("gemini")
    expect(normalizeProvider("anthropic")).toBe("anthropic")
    expect(normalizeProvider("deepseek")).toBe("openai-compatible")
  })

  it("maps chat messages for Gemini", () => {
    expect(
      toGeminiContents([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
      ]),
    ).toEqual([
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Hi" }] },
    ])
  })

  it("keeps Anthropic chat message roles", () => {
    expect(toAnthropicMessages([{ role: "assistant", content: "Ready" }])).toEqual([
      { role: "assistant", content: "Ready" },
    ])
  })
})

function streamProvider(provider: AiProviderName, ...chunks: string[]) {
  const encoder = new TextEncoder()
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(body, { headers: { "Content-Type": "text/event-stream" } }),
  )
  const providerStream = createAiProvider({ provider, apiKey: "fixture", model: "fixture" }).stream(
    [{ role: "user", content: "Hello" }],
    new AbortController().signal,
  )
  return providerStream[Symbol.asyncIterator]()
}

describe("ai provider streams", () => {
  afterEach(() => mock.restore())

  const anthropicDelta =
    'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"text":"Partial"}}\n\n'

  it("handles CRLF split across chunks and multiline SSE data", async () => {
    const stream = streamProvider(
      "anthropic",
      "event: content_block_delta\r",
      '\ndata:{"type":"content_block_delta",\r\ndata: "delta":{"text":"你好"}}\r\n\r',
      '\nevent: message_stop\r\ndata: {"type":"message_stop"}\r\n\r\n',
    )
    expect(await stream.next()).toEqual({ done: false, value: "你好" })
    expect((await stream.next()).done).toBe(true)
  })

  it("keeps partial text and surfaces an Anthropic error event", async () => {
    const stream = streamProvider(
      "anthropic",
      anthropicDelta,
      'event: error\ndata: {"type":"error","error":{"message":"Overloaded"}}\n\n',
    )
    expect((await stream.next()).value).toBe("Partial")
    await expect(stream.next()).rejects.toThrow("Overloaded")
  })

  it("rejects an Anthropic stream that closes before message_stop", async () => {
    const stream = streamProvider("anthropic", anthropicDelta)
    expect((await stream.next()).value).toBe("Partial")
    await expect(stream.next()).rejects.toThrow("ended before message_stop")
  })

  const anthropicRefusal =
    'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"refusal"}}\n\n'

  it("identifies Anthropic refusals with no output", async () => {
    const stream = streamProvider("anthropic", anthropicRefusal)
    await expect(stream.next()).rejects.toBeInstanceOf(AiRefusalError)
  })

  it("identifies Anthropic refusals after partial output", async () => {
    const stream = streamProvider("anthropic", anthropicDelta, anthropicRefusal)
    expect((await stream.next()).value).toBe("Partial")
    await expect(stream.next()).rejects.toBeInstanceOf(AiRefusalError)
  })

  for (const reason of ["max_tokens", "model_context_window_exceeded"]) {
    it(`reports an Anthropic ${reason} limit after partial text`, async () => {
      const stream = streamProvider(
        "anthropic",
        anthropicDelta,
        `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"${reason}"}}\n\n`,
      )
      expect((await stream.next()).value).toBe("Partial")
      await expect(stream.next()).rejects.toThrow("The response is incomplete.")
    })
  }

  const completionStreams = [
    {
      provider: "gemini",
      delta: 'data:{"candidates":[{"content":{"parts":[{"text":"Partial"}]}}]}\r\n\r\n',
      terminal: 'data: {"candidates":[{"finishReason":"STOP"}]}\n\n',
      filtered: 'data: {"candidates":[{"finishReason":"SAFETY"}]}\n\n',
      limited:
        'data: {"candidates":[{"content":{"parts":[{"text":" tail"}]},"finishReason":"MAX_TOKENS"}]}\n\n',
    },
    {
      provider: "openai-compatible",
      delta: 'data: {"choices":[{"delta":{"content":"Partial"},"finish_reason":null}]}\n\n',
      terminal: 'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
      filtered:
        'data: {"choices":[{"delta":{},"finish_reason":"content_filter"}]}\n\ndata: [DONE]\n\n',
      limited: 'data: {"choices":[{"delta":{"content":" tail"},"finish_reason":"length"}]}\n\n',
    },
  ] as const

  for (const { provider, delta, terminal, filtered, limited } of completionStreams) {
    it(`reports a truncated ${provider} stream after preserving its partial text`, async () => {
      const stream = streamProvider(provider, delta)
      expect((await stream.next()).value).toBe("Partial")
      await expect(stream.next()).rejects.toThrow("ended before completion")
    })

    it(`accepts a ${provider} stream with its native finish reason`, async () => {
      const stream = streamProvider(provider, delta, terminal)
      expect((await stream.next()).value).toBe("Partial")
      expect((await stream.next()).done).toBe(true)
    })

    it(`accepts a ${provider} stream with a DONE sentinel`, async () => {
      const stream = streamProvider(provider, delta, "data: [DONE]\n\n")
      expect((await stream.next()).value).toBe("Partial")
      expect((await stream.next()).done).toBe(true)
    })

    it(`surfaces a ${provider} in-band error`, async () => {
      const stream = streamProvider(
        provider,
        delta,
        'event: error\ndata: {"error":{"message":"Overloaded"}}\n\n',
      )
      expect((await stream.next()).value).toBe("Partial")
      await expect(stream.next()).rejects.toThrow("Overloaded")
    })

    it(`reports ${provider} output filtering even without any text`, async () => {
      const stream = streamProvider(provider, filtered)
      await expect(stream.next()).rejects.toThrow("The model provider filtered the response.")
    })

    it(`preserves partial ${provider} text before reporting output filtering`, async () => {
      const stream = streamProvider(provider, delta, filtered)
      expect((await stream.next()).value).toBe("Partial")
      await expect(stream.next()).rejects.toThrow("The model provider filtered the response.")
    })

    it(`keeps ${provider} text from the final chunk before reporting a token limit`, async () => {
      const stream = streamProvider(provider, delta, limited)
      expect((await stream.next()).value).toBe("Partial")
      expect((await stream.next()).value).toBe(" tail")
      await expect(stream.next()).rejects.toThrow("The response is incomplete.")
    })
  }

  it("streams OpenAI refusal text across multiple deltas", async () => {
    const stream = streamProvider(
      "openai-compatible",
      'data: {"choices":[{"delta":{"content":null,"refusal":"I cannot"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"","refusal":" help with that."},"finish_reason":"stop"}]}\n\n',
      "data: [DONE]\n\n",
    )
    expect((await stream.next()).value).toBe("I cannot")
    expect((await stream.next()).value).toBe(" help with that.")
    expect((await stream.next()).done).toBe(true)
  })

  it("preserves a top-level message on an OpenAI-compatible SSE error", async () => {
    const stream = streamProvider(
      "openai-compatible",
      'event: error\ndata: {"type":"error","code":"rate_limit_exceeded","message":"Quota exhausted"}\n\n',
    )
    await expect(stream.next()).rejects.toThrow("Quota exhausted")
  })

  it("reports a Gemini prompt block without waiting for a candidate", async () => {
    const stream = streamProvider("gemini", 'data: {"promptFeedback":{"blockReason":"SAFETY"}}\n\n')
    await expect(stream.next()).rejects.toThrow("Gemini blocked the prompt (SAFETY)")
  })
})
