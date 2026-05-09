import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button, Input, Space, Tag } from "antd"
import { RotateCw } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { type AuditLog, auditLogsQueryOptions } from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/audit-logs")({
  component: AuditLogsRoute,
})

function AuditLogsRoute() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const listParams = { page, pageSize, keyword }
  const auditLogsQuery = useQuery(auditLogsQueryOptions(listParams))

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("auditLogs")}</h1>
          <p className="ame-page-description text-sm">{t("auditLogsDescription")}</p>
        </div>
        <Button
          icon={<RotateCw size={16} />}
          onClick={() => {
            void auditLogsQuery.refetch()
          }}
        />
      </div>

      <DataTable<AuditLog>
        rowKey="id"
        loading={auditLogsQuery.isLoading}
        dataSource={auditLogsQuery.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: auditLogsQuery.data?.total ?? 0,
          showSizeChanger: true,
        }}
        onChange={(pagination) => {
          setPage(pagination.current ?? 1)
          setPageSize(pagination.pageSize ?? 20)
        }}
        title={() => (
          <Input.Search
            allowClear
            className="max-w-sm"
            placeholder={t("searchAuditLogs")}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPage(1)
            }}
          />
        )}
        columns={[
          {
            title: t("createdAt"),
            dataIndex: "createdAt",
            width: 190,
            render: (value) => new Date(value).toLocaleString(),
          },
          {
            title: t("actor"),
            render: (_, record) => (
              <div>
                <div>{record.actorName ?? "-"}</div>
                <div className="ame-text-subtle text-xs">{record.actorEmail ?? "-"}</div>
              </div>
            ),
          },
          {
            title: t("action"),
            dataIndex: "action",
            width: 140,
            render: (value) => <Tag>{value}</Tag>,
          },
          { title: t("resource"), dataIndex: "resource", width: 120 },
          { title: t("summary"), dataIndex: "summary" },
          {
            title: t("detail"),
            dataIndex: "detail",
            render: (value) => (
              <pre className="m-0 max-w-md truncate text-xs">{value ? String(value) : "-"}</pre>
            ),
          },
        ]}
      />
    </Space>
  )
}
