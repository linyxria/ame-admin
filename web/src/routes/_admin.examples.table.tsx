import { createFileRoute } from "@tanstack/react-router"
import { Button, Input, Space, Tag } from "antd"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel, ToolbarSurface } from "../components/design-system"

export const Route = createFileRoute("/_admin/examples/table")({
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
      <PageHeader title={t("tableDemo")} description={t("tableDescription")} />
      <SectionPanel
        title={t("tableDemo")}
        actions={
          <ToolbarSurface>
            <Input.Search placeholder={t("searchProject")} className="w-64" />
            <Button>{t("reset")}</Button>
            <Button>{t("bulkArchive")}</Button>
            <Button type="primary">{t("createProject")}</Button>
          </ToolbarSurface>
        }
      >
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
      </SectionPanel>
    </Space>
  )
}
