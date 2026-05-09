import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Avatar, Badge, Button, Empty, Popover, Tabs } from "antd"
import { Bell } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  readAllNotificationsMutationOptions,
  readNotificationMutationOptions,
} from "../services/system/mutations"
import { notificationsQueryOptions, systemQueryKeys } from "../services/system/queries"

function formatTime(value: Date | string) {
  return new Date(value).toLocaleString()
}

export function Notifications() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [type, setType] = useState("message")
  const listParams = { page: 1, pageSize: 100 }
  const notificationsQuery = useQuery({
    ...notificationsQueryOptions(listParams),
    refetchInterval: 60_000,
  })
  const items = notificationsQuery.data?.items ?? []
  const unread = notificationsQuery.data?.unreadTotal ?? 0
  const visibleItems = items.filter((item) => item.type === type)
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["system", "notifications"] }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.overview }),
    ])
  }
  const readAll = useMutation({
    ...readAllNotificationsMutationOptions(),
    onSuccess: refresh,
  })
  const readOne = useMutation({
    ...readNotificationMutationOptions(),
    onSuccess: refresh,
  })

  const content = (
    <div className="w-96 max-w-[calc(100vw-32px)]">
      <div className="px-4">
        <Tabs
          activeKey={type}
          onChange={setType}
          items={[
            {
              key: "message",
              label: `${t("messages")} (${items.filter((item) => item.type === "message").length})`,
            },
            {
              key: "notice",
              label: `${t("notices")} (${items.filter((item) => item.type === "notice").length})`,
            },
            {
              key: "todo",
              label: `${t("todos")} (${items.filter((item) => item.type === "todo").length})`,
            },
          ]}
          tabBarExtraContent={
            <Button type="link" loading={readAll.isPending} onClick={() => readAll.mutate()}>
              {t("markAllRead")}
            </Button>
          }
          styles={{ header: { marginBottom: 0 } }}
        />
      </div>
      <div className="max-h-96 overflow-auto">
        {visibleItems.length ? (
          visibleItems.map((item) => (
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
              <Badge dot={!item.readAt}>
                <Avatar>{item.title.slice(0, 1)}</Avatar>
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="ame-text font-medium">{item.title}</div>
                <div className="ame-text-muted mt-1">{item.description}</div>
                <div className="ame-text-subtle mt-1 text-sm">{formatTime(item.createdAt)}</div>
              </div>
            </button>
          ))
        ) : (
          <Empty className="py-8" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      <div className="grid grid-cols-2 py-1">
        <Button type="link" loading={readAll.isPending} onClick={() => readAll.mutate()}>
          {t("markAllRead")}
        </Button>
        <Link to="/notifications" className="py-1 text-center">
          {t("viewMore")}
        </Link>
      </div>
    </div>
  )

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      content={content}
      styles={{ container: { padding: 0 } }}
    >
      <Button type="text" aria-label={t("notifications")} loading={notificationsQuery.isLoading}>
        <Badge count={unread} size="small">
          <Bell size={18} />
        </Badge>
      </Button>
    </Popover>
  )
}
