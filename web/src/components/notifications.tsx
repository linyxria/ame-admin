import { ActionIcon, Avatar, Button, Indicator, Popover, Tabs } from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Bell } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { showRequestError } from "../lib/request-notification"
import {
  readAllNotificationsMutationOptions,
  readNotificationMutationOptions,
} from "../services/system/mutations"
import { notificationsQueryOptions, notificationsQueryPrefixKey } from "../services/system/queries"
import { EmptyState } from "./design-system"

const notificationTabs = [
  { value: "message", label: "messages" },
  { value: "notice", label: "notices" },
  { value: "todo", label: "todos" },
] as const

function formatTime(value: Date | string) {
  return new Date(value).toLocaleString()
}

export function Notifications() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  const [type, setType] = useState<string | null>("message")
  const listParams = { page: 1, pageSize: 100 }
  const notificationsQuery = useQuery({
    ...notificationsQueryOptions(listParams),
    refetchInterval: 60_000,
  })
  const items = notificationsQuery.data?.items ?? []
  const unread = notificationsQuery.data?.unreadTotal ?? 0
  const tabs = notificationTabs.map((tab) => ({
    ...tab,
    items: items.filter((item) => item.type === tab.value),
  }))
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: notificationsQueryPrefixKey })
  }
  const readAll = useMutation({
    ...readAllNotificationsMutationOptions(),
    onSuccess: refresh,
    onError: (error) => showRequestError(error, t("requestFailed")),
  })
  const readOne = useMutation({
    ...readNotificationMutationOptions(),
    onSuccess: refresh,
    onError: (error) => showRequestError(error, t("requestFailed")),
  })

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" trapFocus shadow="md">
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          className="ame-topbar-icon"
          aria-label={unread ? `${t("notifications")} (${unread})` : t("notifications")}
          onClick={() => setOpened((value) => !value)}
        >
          <Indicator disabled={!unread} label={unread > 99 ? "99+" : unread} size={16}>
            <Bell size={18} />
          </Indicator>
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0} className="w-[min(24rem,90vw)]">
        <Tabs value={type} onChange={setType} keepMounted={false}>
          <Tabs.List className="px-2" aria-label={t("notifications")}>
            {tabs.map((tab) => (
              <Tabs.Tab key={tab.value} value={tab.value}>
                {t(tab.label)} ({tab.items.length})
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Panel
              key={tab.value}
              value={tab.value}
              tabIndex={tab.items.length ? undefined : 0}
              className="max-h-96 overflow-auto"
            >
              {tab.items.length ? (
                tab.items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="ame-border flex w-full gap-4 border-b px-5 py-4 text-left"
                    onClick={() => {
                      if (!item.readAt) {
                        readOne.mutate(item.id)
                      }
                    }}
                  >
                    <Indicator disabled={Boolean(item.readAt)} size={8}>
                      <Avatar>{item.title.slice(0, 1)}</Avatar>
                    </Indicator>
                    <div className="min-w-0 flex-1">
                      <div className="ame-text font-medium">{item.title}</div>
                      <div className="ame-text-muted mt-1">{item.description}</div>
                      <div className="ame-text-subtle mt-1 text-sm">
                        {formatTime(item.createdAt)}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState description={t("noNotifications")} />
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
        <div className="grid grid-cols-2 gap-1 p-1">
          <Button variant="subtle" loading={readAll.isPending} onClick={() => readAll.mutate()}>
            {t("markAllRead")}
          </Button>
          <Button
            component={Link}
            to="/notifications"
            variant="subtle"
            onClick={() => setOpened(false)}
          >
            {t("viewMore")}
          </Button>
        </div>
      </Popover.Dropdown>
    </Popover>
  )
}
