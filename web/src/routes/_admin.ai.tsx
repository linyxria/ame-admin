import { Bubble, type BubbleItemType, Sender } from "@ant-design/x"
import { createFileRoute } from "@tanstack/react-router"
import { App, Avatar, Button, Space, Tag } from "antd"
import { Bot, BrainCircuit, Cpu, DatabaseZap, FileText, Plus, Sparkles, User } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { StatusPill } from "../components/design-system"
import { API_URL } from "../lib/config"

export const Route = createFileRoute("/_admin/ai")({
  component: AiRoute,
})

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  loading?: boolean
}

function parseSseChunk(buffer: string) {
  const events = buffer.split("\n\n")
  const rest = events.pop() ?? ""

  return {
    rest,
    events: events
      .map((event) => {
        const type = event
          .split("\n")
          .find((line) => line.startsWith("event: "))
          ?.slice(7)
        const data = event
          .split("\n")
          .filter((line) => line.startsWith("data: "))
          .map((line) => line.slice(6))
          .join("\n")

        return type && data ? { type, data } : null
      })
      .filter((event): event is { type: string; data: string } => Boolean(event)),
  }
}

function AiRoute() {
  const { message } = App.useApp()
  const { t } = useTranslation()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [providerMeta, setProviderMeta] = useState<{ provider: string; model: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: t("aiWelcome"),
    },
  ])

  const items: BubbleItemType[] = messages.map((item) => ({
    key: item.id,
    role: item.role,
    content: item.content,
    loading: item.loading,
  }))

  const send = async (value: string) => {
    const content = value.trim()

    if (!content || loading) {
      return
    }

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content }
    const assistantId = crypto.randomUUID()
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      loading: true,
    }
    const nextMessages = messages.concat(userMessage, assistantMessage)

    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((item) => item.content)
            .map((item) => ({ role: item.role, content: item.content })),
        }),
      })

      if (!response.ok || !response.body) {
        const error = (await response.json().catch(() => null)) as { message?: string } | null
        throw new Error(error?.message ?? t("aiRequestFailed"))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let rest = ""

      while (true) {
        const { value: chunk, done } = await reader.read()

        if (done) {
          break
        }

        const parsed = parseSseChunk(rest + decoder.decode(chunk, { stream: true }))
        rest = parsed.rest

        for (const event of parsed.events) {
          const data = JSON.parse(event.data) as {
            content?: string
            message?: string
            provider?: string
            model?: string
          }

          if (event.type === "meta" && data.provider && data.model) {
            setProviderMeta({ provider: data.provider, model: data.model })
          } else if (event.type === "delta" && data.content) {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantId
                  ? { ...item, content: item.content + data.content, loading: false }
                  : item,
              ),
            )
          }

          if (event.type === "error") {
            throw new Error(data.message ?? t("aiRequestFailed"))
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("aiRequestFailed")
      message.error(errorMessage)
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId ? { ...item, content: errorMessage, loading: false } : item,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="ame-hero-panel">
        <div>
          <h1 className="ame-page-title mb-2 text-3xl font-semibold">{t("aiAssistant")}</h1>
          <p className="ame-page-description text-sm">{t("aiAssistantDescription")}</p>
        </div>
        <Space wrap>
          <Tag icon={<Cpu size={14} />} color="blue" className="px-3 py-1">
            {providerMeta
              ? `${providerMeta.provider} · ${providerMeta.model}`
              : t("aiProviderReady")}
          </Tag>
          <StatusPill tone="green">Operational</StatusPill>
        </Space>
      </div>
      <div className="ame-ai-shell min-h-0 flex-1 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <aside className="ame-ai-session-rail min-h-0 p-4">
          <Button type="primary" block icon={<Plus size={15} />}>
            New Session
          </Button>
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ame-text-subtle)]">
              Today
            </div>
            <div className="grid gap-1.5">
              {[t("aiSuggestionOps"), t("aiSuggestionPermission"), t("aiSuggestionData")].map(
                (item, index) => (
                  <button
                    type="button"
                    key={item}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                      index === 0
                        ? "bg-blue-50 text-blue-700"
                        : "text-[var(--ame-text-muted)] hover:bg-[var(--ame-hover)]"
                    }`}
                    onClick={() => setInput(item)}
                  >
                    <span className="block truncate font-medium">{item}</span>
                    <span className="mt-1 block text-xs text-[var(--ame-text-subtle)]">
                      {index === 0 ? "10:24 AM" : "Earlier"}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="mt-6 border-t border-[var(--ame-border-soft)] pt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ame-text)]">
              <Sparkles size={16} />
              {t("aiSuggestions")}
            </div>
            <div className="text-xs leading-5 text-[var(--ame-text-subtle)]">
              {t("aiProviderHint")}
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col">
          <div className="border-b border-[var(--ame-border-soft)] px-5 py-4">
            <div className="font-semibold text-[var(--ame-text)]">Pump vibration analysis</div>
            <div className="mt-1 text-xs text-[var(--ame-text-subtle)]">
              Streaming workspace for operational diagnostics
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-[#fbfcfe] p-6">
            <div className="mx-auto max-w-4xl">
              <Bubble.List
                autoScroll
                items={items}
                role={{
                  assistant: {
                    placement: "start",
                    avatar: <Avatar className="bg-blue-600" icon={<Bot size={16} />} />,
                  },
                  user: {
                    placement: "end",
                    avatar: <Avatar icon={<User size={16} />} />,
                  },
                }}
              />
            </div>
          </div>
          <div className="border-t border-[var(--ame-border-soft)] p-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex flex-wrap gap-2">
                {["Show trend chart", "Compare assets", "Create work order", "Explain more"].map(
                  (item) => (
                    <Button key={item} size="small" onClick={() => setInput(item)}>
                      {item}
                    </Button>
                  ),
                )}
              </div>
              <Sender
                value={input}
                loading={loading}
                placeholder={t("aiInputPlaceholder")}
                onChange={setInput}
                onSubmit={send}
                onCancel={() => setLoading(false)}
              />
            </div>
          </div>
        </main>

        <aside className="ame-ai-context-rail min-h-0 p-4">
          <ContextBlock
            title="Context"
            items={[
              ["Asset", "PMP-1042"],
              ["Time Range", "Last 7 days"],
              ["Data Sources", "Connected"],
            ]}
          />
          <div className="mt-4">
            <div className="mb-3 text-sm font-semibold text-[var(--ame-text)]">Capabilities</div>
            <Capability icon={<BrainCircuit size={16} />} title="Data Analysis" />
            <Capability icon={<FileText size={16} />} title="Document Q&A" />
            <Capability icon={<DatabaseZap size={16} />} title="Report Generation" />
          </div>
        </aside>
      </div>
    </div>
  )
}

function ContextBlock({ items, title }: { items: [string, string][]; title: string }) {
  return (
    <div className="rounded-xl border border-[var(--ame-border-soft)] bg-white p-4">
      <div className="mb-3 font-semibold text-[var(--ame-text)]">{title}</div>
      <div className="grid gap-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs text-[var(--ame-text-subtle)]">{label}</div>
            <div className="mt-0.5 text-sm font-semibold text-[var(--ame-text)]">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Capability({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-2 flex gap-3 rounded-lg border border-[var(--ame-border-soft)] bg-white p-3">
      <span className="mt-0.5 text-blue-600">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-[var(--ame-text)]">{title}</div>
        <div className="mt-0.5 text-xs leading-5 text-[var(--ame-text-subtle)]">
          Analyze, summarize, and turn findings into actions.
        </div>
      </div>
    </div>
  )
}
