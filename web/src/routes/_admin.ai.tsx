import {
  AssistantRuntimeProvider,
  AuiIf,
  type ChatModelAdapter,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useLocalRuntime,
} from "@assistant-ui/react"
import { ActionIcon, Avatar, Badge, Button, Group, Loader, Stack, Text } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowUp, Bot, Cpu, Plus, Square, User } from "lucide-react"
import { type MouseEvent, useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "../components/design-system"
import { api } from "../lib/api"
import { readChatStream } from "../lib/chat-stream"
import { getRequestErrorMessage } from "../lib/request-notification"

export const Route = createFileRoute("/_admin/ai")({
  component: AiRoute,
})

function AiRoute() {
  const { t } = useTranslation()
  const [provider, setProvider] = useState<{ provider: string; model: string }>()
  const adapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      const history = messages.flatMap((message) => {
        if (message.role !== "user" && message.role !== "assistant") return []
        const content = message.content
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")
        return content ? [{ role: message.role, content }] : []
      })
      const fallback = t("aiRequestFailed")

      try {
        const stream = await api.ai.chat.post(
          { messages: history },
          { fetch: { signal: abortSignal } },
        )
        yield* readChatStream(stream, setProvider, { fallback, emptyReply: t("aiEmptyReply") })
      } catch (error) {
        if (abortSignal.aborted) return
        throw new Error(getRequestErrorMessage(error, fallback), { cause: error })
      }
    },
  }
  const runtime = useLocalRuntime(adapter)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <PageHeader
          title={t("aiAssistant")}
          description={t("aiAssistantDescription")}
          actions={<NewConversation />}
          status={
            provider && (
              <Badge variant="light" leftSection={<Cpu size={14} />}>
                {provider.provider} · {provider.model}
              </Badge>
            )
          }
        />
        <Conversation />
      </div>
    </AssistantRuntimeProvider>
  )
}

function NewConversation() {
  const { t } = useTranslation()
  const aui = useAui()

  return (
    <Button
      variant="default"
      leftSection={<Plus size={16} />}
      onClick={() => {
        aui.thread().cancelRun()
        aui.threads().switchToNewThread()
      }}
    >
      {t("aiNewChat")}
    </Button>
  )
}

function Conversation() {
  const { t } = useTranslation()
  const aui = useAui()
  const composerInput = useRef<HTMLTextAreaElement>(null)
  const stopActivated = useRef(false)
  const restoreFocusOnStopRemoval = useCallback((button: HTMLButtonElement | null) => {
    if (!button) return

    return () => {
      if (!stopActivated.current && button.ownerDocument.activeElement === button) {
        composerInput.current?.focus({ preventScroll: true })
      }
      stopActivated.current = false
    }
  }, [])
  const suggestions = [t("aiSuggestionOps"), t("aiSuggestionPermission"), t("aiSuggestionData")]
  const followUps = [
    t("aiShowTrend"),
    t("aiCompareAssets"),
    t("aiCreateWorkOrder"),
    t("aiExplainMore"),
  ]

  function focusComposerOnKeyboardActivation(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0) composerInput.current?.focus({ preventScroll: true })
  }

  return (
    <ThreadPrimitive.Root
      role="region"
      aria-label={t("aiAssistant")}
      className="ame-ai-shell flex min-h-88 flex-1 flex-col"
    >
      <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-3xl">
          <ThreadPrimitive.Empty>
            <Stack gap="sm" align="flex-start">
              <Avatar color="brand" variant="light">
                <Bot size={20} />
              </Avatar>
              <Text>{t("aiWelcome")}</Text>
              <Group gap="xs">
                {suggestions.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="default"
                    onClick={() => aui.composer().setText(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </Group>
            </Stack>
          </ThreadPrimitive.Empty>
          <Stack gap="md">
            <ThreadPrimitive.Messages>
              {({ message }) => {
                const { status } = message
                if (
                  status?.type === "incomplete" &&
                  status.reason === "cancelled" &&
                  message.content.length === 0
                ) {
                  return null
                }
                return <ChatMessage fromUser={message.role === "user"} />
              }}
            </ThreadPrimitive.Messages>
          </Stack>
        </div>
      </ThreadPrimitive.Viewport>
      <div className="border-t border-(--ame-border-soft) bg-(--ame-surface) p-3 md:p-4">
        <Group className="mx-auto mb-2 max-w-3xl" gap="xs">
          {followUps.map((prompt) => (
            <Button
              key={prompt}
              size="xs"
              variant="light"
              onClick={() => aui.composer().setText(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </Group>
        <ComposerPrimitive.Root className="ame-border mx-auto flex max-w-3xl items-end gap-2 rounded-lg border p-2 focus-within:border-(--ame-accent)">
          <ComposerPrimitive.Input
            ref={composerInput}
            aria-label={t("aiInputPlaceholder")}
            placeholder={t("aiInputPlaceholder")}
            rows={1}
            className="min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
          />
          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send
              aria-label={t("aiSend")}
              onClick={focusComposerOnKeyboardActivation}
              render={<ActionIcon size="lg" />}
            >
              <ArrowUp size={18} />
            </ComposerPrimitive.Send>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel
              ref={restoreFocusOnStopRemoval}
              aria-label={t("aiStop")}
              onClick={(event) => {
                stopActivated.current = true
                focusComposerOnKeyboardActivation(event)
              }}
              render={<ActionIcon size="lg" variant="default" />}
            >
              <Square size={16} />
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  )
}

function ChatMessage({ fromUser }: { fromUser: boolean }) {
  const { t } = useTranslation()

  return (
    <MessagePrimitive.Root
      className={`flex items-start gap-2 ${fromUser ? "flex-row-reverse" : ""}`}
    >
      <Avatar size="sm" color={fromUser ? "gray" : "brand"} variant="light">
        {fromUser ? <User size={16} /> : <Bot size={16} />}
      </Avatar>
      <div
        className={`ame-border max-w-[85%] rounded-lg border px-3 py-2 text-sm wrap-anywhere whitespace-pre-wrap ${fromUser ? "bg-(--ame-surface-raised)" : "bg-(--ame-surface)"}`}
      >
        <MessagePrimitive.Parts />
        <AuiIf
          condition={(state) =>
            state.message.status?.type === "running" && state.message.content.length === 0
          }
        >
          <span className="inline-flex" role="status" aria-label={t("aiGenerating")}>
            <Loader size="xs" type="dots" />
          </span>
        </AuiIf>
        <MessagePrimitive.Error>
          <ErrorPrimitive.Root className="text-sm text-(--mantine-color-error)" role="alert">
            <ErrorPrimitive.Message />
          </ErrorPrimitive.Root>
        </MessagePrimitive.Error>
      </div>
    </MessagePrimitive.Root>
  )
}
