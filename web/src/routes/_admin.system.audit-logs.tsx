import { Badge, Stack, TextInput } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { RotateCw } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel } from "../components/design-system"
import { IconAction } from "../components/icon-action"
import { type AuditLog, auditLogsQueryOptions } from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/audit-logs")({
  component: AuditLogsRoute,
})

function AuditLogsRoute() {
  const { t, i18n } = useTranslation()
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const listParams = { page, pageSize, keyword }
  const auditLogsQuery = useQuery(auditLogsQueryOptions(listParams))

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("auditLogs")}
        description={t("auditLogsDescription")}
        actions={
          <IconAction label={t("refresh")} onClick={() => void auditLogsQuery.refetch()}>
            <RotateCw size={16} />
          </IconAction>
        }
      />

      <SectionPanel
        title={t("auditLogs")}
        actions={
          <TextInput
            type="search"
            aria-label={t("searchAuditLogs")}
            className="max-w-sm"
            placeholder={t("searchAuditLogs")}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.currentTarget.value)
              setPage(1)
            }}
          />
        }
      >
        <DataTable<AuditLog>
          loading={auditLogsQuery.isFetching}
          error={auditLogsQuery.error}
          rows={auditLogsQuery.data?.items ?? []}
          pagination={{
            page,
            pageSize,
            total: auditLogsQuery.data?.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setPage(1)
            },
          }}
          columns={[
            {
              key: "createdAt",
              header: t("createdAt"),
              width: 190,
              cell: (record) => new Date(record.createdAt).toLocaleString(i18n.language),
            },
            {
              key: "actor",
              header: t("actor"),
              cell: (record) => (
                <div>
                  <div>{record.actorName ?? "–"}</div>
                  <div className="ame-text-subtle text-xs">{record.actorEmail ?? "–"}</div>
                </div>
              ),
            },
            {
              key: "action",
              header: t("action"),
              width: 140,
              cell: (record) => <Badge variant="light">{record.action}</Badge>,
            },
            {
              key: "resource",
              header: t("resource"),
              width: 120,
              cell: (record) => record.resource,
            },
            { key: "summary", header: t("summary"), cell: (record) => record.summary },
            {
              key: "detail",
              header: t("detail"),
              cell: (record) => (
                <pre className="m-0 max-w-md truncate text-xs">
                  {record.detail ? String(record.detail) : "–"}
                </pre>
              ),
            },
          ]}
        />
      </SectionPanel>
    </Stack>
  )
}
