import assert from "node:assert/strict"
import { test } from "node:test"
import { streamResponse } from "@elysia/eden/treaty2"
import { api } from "../src/lib/api.ts"
import { readChatStream } from "../src/lib/chat-stream.ts"

const streamMessages = {
  fallback: "stream interrupted",
  emptyReply: "The model returned no text.",
}

function response(...chunks: string[]) {
  const encoder = new TextEncoder()
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(body, { headers: { "Content-Type": "text/event-stream" } })
}

test("converts split SSE events to cumulative assistant messages and reports the provider", async () => {
  const stream = streamResponse(
    response(
      'event: meta\ndata: {"provider":"demo","model":"test"}\n\nevent: delta\ndata: {"content":" \\n"}\n\nevent: delta\nda',
      'ta: {"content":"你"}\n\nevent: delta\ndata: {"content":"好"}\n\nevent: done\ndata: {}\n\n',
    ),
  )
  const results = []
  const providers = []
  for await (const result of readChatStream(
    stream,
    (meta) => providers.push(meta),
    streamMessages,
  )) {
    results.push(result)
  }
  assert.deepEqual(results, [
    { content: [{ type: "text", text: " \n你" }] },
    { content: [{ type: "text", text: " \n你好" }] },
  ])
  assert.deepEqual(providers, [{ provider: "demo", model: "test" }])
})

test("surfaces stream errors and rejects a response that ends without done", async () => {
  const error = streamResponse(response('event: error\ndata: {"message":"provider failed"}\n\n'))
  await assert.rejects(readChatStream(error, () => {}, streamMessages).next(), /provider failed/)

  const truncated = streamResponse(response('event: delta\ndata: {"content":"partial"}\n\n'))
  const content = readChatStream(truncated, () => {}, streamMessages)
  assert.deepEqual((await content.next()).value, { content: [{ type: "text", text: "partial" }] })
  await assert.rejects(content.next(), /stream interrupted/)
})

for (const [description, deltas] of [
  ["no text", []],
  ["only whitespace", ['event: delta\ndata: {"content":" \\n\\t"}\n\n']],
] as const) {
  test(`reports an empty reply when a stream completes with ${description}`, async () => {
    const stream = streamResponse(response(...deltas, "event: done\ndata: {}\n\n"))
    const results = await Array.fromAsync(readChatStream(stream, () => {}, streamMessages))
    assert.deepEqual(results, [
      {
        content: [],
        status: { type: "incomplete", reason: "error", error: streamMessages.emptyReply },
      },
    ])
  })
}

test("replaces refused text with an incomplete message that displays the refusal", async () => {
  const stream = streamResponse(
    response(
      'event: delta\ndata: {"content":"provisional text"}\n\n',
      'event: error\ndata: {"reason":"refusal","message":"The model provider declined to answer."}\n\n',
    ),
  )

  assert.deepEqual(await Array.fromAsync(readChatStream(stream, () => {}, streamMessages)), [
    { content: [{ type: "text", text: "provisional text" }] },
    {
      content: [],
      status: {
        type: "incomplete",
        reason: "error",
        error: "The model provider declined to answer.",
      },
    },
  ])
})

test("keeps partial text when the model reaches a token limit", async () => {
  const stream = streamResponse(
    response(
      'event: delta\ndata: {"content":"partial"}\n\n',
      'event: error\ndata: {"message":"The model reached a token limit. The response is incomplete."}\n\n',
    ),
  )
  const content = readChatStream(stream, () => {}, streamMessages)

  assert.deepEqual((await content.next()).value, { content: [{ type: "text", text: "partial" }] })
  await assert.rejects(content.next(), /token limit/)
})

test("preserves ISO timestamp text through the shared Treaty client", async (t) => {
  const timestamp = "2026-11-25T12:00:00.000Z"
  t.mock.method(globalThis, "fetch", async () =>
    response(
      `event: delta\ndata: ${JSON.stringify({ content: timestamp })}\n\nevent: done\ndata: {}\n\n`,
    ),
  )

  const stream = await api.ai.chat.post(
    { messages: [{ role: "user", content: "Show the recorded time" }] },
    { fetch: { signal: new AbortController().signal } },
  )
  assert.deepEqual(await Array.fromAsync(readChatStream(stream, () => {}, streamMessages)), [
    { content: [{ type: "text", text: timestamp }] },
  ])
})
