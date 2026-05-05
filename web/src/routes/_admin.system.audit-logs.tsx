import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button, Input, Space, Table, Tag } from "antd"
import { RotateCw } from "lucide-react"
import { useState } from "react"
import { type AuditLog, systemApi, systemQueryKeys } from "../lib/system-api"

export const Route = createFileRoute("/_admin/system/audit-logs")({
  component: AuditLogsRoute,
})

function AuditLogsRoute() {
  const [keyword, setKeyword] = useState("")
  const auditLogsQuery = useQuery({
    queryKey: systemQueryKeys.auditLogs(keyword),
    queryFn: () => systemApi.auditLogs(keyword),
  })

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">审计日志</h1>
          <p className="ame-page-description text-sm">查看后台关键操作记录。</p>
        </div>
        <Button
          icon={<RotateCw size={16} />}
          onClick={() => {
            void auditLogsQuery.refetch()
          }}
        />
      </div>

      <Table<AuditLog>
        rowKey="id"
        loading={auditLogsQuery.isLoading}
        dataSource={auditLogsQuery.data ?? []}
        pagination={{ showSizeChanger: true }}
        title={() => (
          <Input.Search
            allowClear
            className="max-w-sm"
            placeholder="搜索操作人、资源或摘要"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        )}
        columns={[
          {
            title: "时间",
            dataIndex: "createdAt",
            width: 190,
            render: (value) => new Date(value).toLocaleString(),
          },
          {
            title: "操作人",
            render: (_, record) => (
              <div>
                <div>{record.actorName ?? "-"}</div>
                <div className="ame-text-subtle text-xs">{record.actorEmail ?? "-"}</div>
              </div>
            ),
          },
          { title: "动作", dataIndex: "action", width: 140, render: (value) => <Tag>{value}</Tag> },
          { title: "资源", dataIndex: "resource", width: 120 },
          { title: "摘要", dataIndex: "summary" },
          {
            title: "详情",
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
