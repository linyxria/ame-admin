import { createFileRoute } from "@tanstack/react-router"
import { Button, Card, Input, Space, Tag } from "antd"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"

export const Route = createFileRoute("/_admin/demos/table")({
  component: TableDemoRoute,
})

function TableDemoRoute() {
  const { t } = useTranslation()
  const rows = [
    { id: 1, name: t("permissionsRefactor"), owner: "Lucy", status: "running", progress: "72%" },
    { id: 2, name: t("notificationsDesign"), owner: "Ning", status: "review", progress: "48%" },
    { id: 3, name: t("componentLibraryUpgrade"), owner: "Zheng", status: "done", progress: "100%" },
  ]
  const statusLabels = {
    running: t("running"),
    review: t("reviewing"),
    done: t("done"),
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("tableDemo")}</h1>
        <p className="ame-page-description text-sm">{t("tableDescription")}</p>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Space>
            <Input.Search placeholder={t("searchProject")} className="w-64" />
            <Button>{t("reset")}</Button>
          </Space>
          <Space>
            <Button>{t("bulkArchive")}</Button>
            <Button type="primary">{t("createProject")}</Button>
          </Space>
        </div>
        <DataTable
          rowKey="id"
          rowSelection={{}}
          dataSource={rows}
          columns={[
            { title: t("project"), dataIndex: "name" },
            { title: t("owner"), dataIndex: "owner" },
            {
              title: t("status"),
              dataIndex: "status",
              filters: [
                { text: t("running"), value: "running" },
                { text: t("reviewing"), value: "review" },
                { text: t("done"), value: "done" },
              ],
              render: (value: keyof typeof statusLabels) => (
                <Tag color={value === "done" ? "green" : "blue"}>{statusLabels[value]}</Tag>
              ),
            },
            { title: t("progress"), dataIndex: "progress" },
            {
              title: t("operation"),
              fixed: "right",
              render: () => <Button type="link">{t("details")}</Button>,
            },
          ]}
        />
      </Card>
    </Space>
  )
}
