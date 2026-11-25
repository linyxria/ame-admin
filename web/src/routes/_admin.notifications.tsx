import { Badge, Button, Stack } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel } from "../components/design-system"
import { IconAction } from "../components/icon-action"
import { showRequestError } from "../lib/request-notification"
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
  const { t, i18n } = useTranslation()
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
    onSuccess: async () => {
      await refresh()
      notifications.show({ color: "green", message: t("markedAllRead") })
    },
    onError: (error) => showRequestError(error, t("requestFailed")),
  })
  const remove = useMutation({
    ...deleteNotificationMutationOptions(),
    onSuccess: refresh,
    onError: (error) => showRequestError(error, t("deleteFailed")),
  })

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("notificationCenter")}
        description={t("notificationsDescription")}
        actions={
          <Button
            leftSection={<CheckCheck size={16} />}
            loading={readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            {t("markAllRead")}
          </Button>
        }
      />

      <SectionPanel title={t("notificationCenter")}>
        <DataTable<NotificationItem>
          loading={notificationsQuery.isFetching}
          error={notificationsQuery.error}
          rows={notificationsQuery.data?.items ?? []}
          pagination={{
            page,
            pageSize,
            total: notificationsQuery.data?.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setPage(1)
            },
          }}
          columns={[
            {
              key: "status",
              header: t("status"),
              width: 100,
              cell: (item) => (
                <Badge variant="light" color={item.readAt ? "gray" : "blue"}>
                  {item.readAt ? t("read") : t("unread")}
                </Badge>
              ),
            },
            {
              key: "type",
              header: t("type"),
              width: 100,
              cell: (item) => <Badge variant="light">{item.type}</Badge>,
            },
            { key: "title", header: t("title"), cell: (item) => item.title },
            { key: "content", header: t("content"), cell: (item) => item.description || "–" },
            {
              key: "createdAt",
              header: t("createdAt"),
              width: 190,
              cell: (item) => new Date(item.createdAt).toLocaleString(i18n.language),
            },
            {
              key: "actions",
              header: t("operation"),
              width: 90,
              cell: (item) => (
                <IconAction
                  label={t("delete")}
                  confirmation={t("confirmDeleteNotification")}
                  color="red"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(item.id)}
                >
                  <Trash2 size={16} />
                </IconAction>
              ),
            },
          ]}
        />
      </SectionPanel>
    </Stack>
  )
}
