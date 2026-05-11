import { describe, expect, it } from "bun:test"
import { normalizeProvider, toAnthropicMessages, toGeminiContents } from "./provider"

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
