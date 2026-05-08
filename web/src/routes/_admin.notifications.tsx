import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { App, Button, Space, Table, Tag } from "antd"
import { CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { type NotificationItem, systemApi, systemQueryKeys } from "../lib/system-api"

export const Route = createFileRoute("/_admin/notifications")({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const listParams = { page, pageSize }
  const notificationsQuery = useQuery({
    queryKey: systemQueryKeys.notifications(listParams),
    queryFn: () => systemApi.notifications(listParams),
  })
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["system", "notifications"] })
  }
  const readAll = useMutation({
    mutationFn: systemApi.readAllNotifications,
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: systemApi.deleteNotification,
    onSuccess: refresh,
  })

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">通知中心</h1>
          <p className="ame-page-description text-sm">查看消息、通知和待办。</p>
        </div>
        <Button
          icon={<CheckCheck size={16} />}
          loading={readAll.isPending}
          onClick={async () => {
            await readAll.mutateAsync()
            message.success("已全部标记为已读")
          }}
        >
          全部已读
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
            title: "状态",
            dataIndex: "readAt",
            width: 100,
            render: (value) => (
              <Tag color={value ? "default" : "blue"}>{value ? "已读" : "未读"}</Tag>
            ),
          },
          { title: "类型", dataIndex: "type", width: 100, render: (value) => <Tag>{value}</Tag> },
          { title: "标题", dataIndex: "title" },
          { title: "内容", dataIndex: "description", render: (value) => value || "-" },
          {
            title: "时间",
            dataIndex: "createdAt",
            width: 190,
            render: (value) => new Date(value).toLocaleString(),
          },
          {
            title: "操作",
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
