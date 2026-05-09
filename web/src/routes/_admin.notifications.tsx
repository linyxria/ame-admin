import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { App, Button, Space, Table, Tag } from "antd"
import { CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  deleteNotificationMutationOptions,
  readAllNotificationsMutationOptions,
} from "../services/system/mutations"
import {
  type NotificationItem,
  notificationsQueryOptions,
  notificationsQueryPrefixKey,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/notifications")({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  const { message } = App.useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const listParams = { page, pageSize }
  const notificationsQuery = useQuery(notificationsQueryOptions(listParams))
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: notificationsQueryPrefixKey })
  }
  const readAll = useMutation({
    ...readAllNotificationsMutationOptions(),
    onSuccess: refresh,
  })
  const remove = useMutation({
    ...deleteNotificationMutationOptions(),
    onSuccess: refresh,
  })

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">
            {t("notificationCenter")}
          </h1>
          <p className="ame-page-description text-sm">{t("notificationsDescription")}</p>
        </div>
        <Button
          icon={<CheckCheck size={16} />}
          loading={readAll.isPending}
          onClick={async () => {
            await readAll.mutateAsync()
            message.success(t("markedAllRead"))
          }}
        >
          {t("markAllRead")}
        </Button>
      </div>

      <Table<NotificationItem>
        rowKey="id"
        loading={notificationsQuery.isLoading}
        dataSource={notificationsQuery.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: notificationsQuery.data?.total ?? 0,
          showSizeChanger: true,
        }}
        onChange={(pagination) => {
          setPage(pagination.current ?? 1)
          setPageSize(pagination.pageSize ?? 20)
        }}
        columns={[
          {
            title: t("status"),
            dataIndex: "readAt",
            width: 100,
            render: (value) => (
              <Tag color={value ? "default" : "blue"}>{value ? t("read") : t("unread")}</Tag>
            ),
          },
          {
            title: t("type"),
            dataIndex: "type",
            width: 100,
            render: (value) => <Tag>{value}</Tag>,
          },
          { title: t("title"), dataIndex: "title" },
          { title: t("content"), dataIndex: "description", render: (value) => value || "-" },
          {
            title: t("createdAt"),
            dataIndex: "createdAt",
            width: 190,
            render: (value) => new Date(value).toLocaleString(),
          },
          {
            title: t("operation"),
            width: 90,
            render: (_, record) => (
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                onClick={() => remove.mutate(record.id)}
              />
            ),
          },
        ]}
      />
    </Space>
  )
}
