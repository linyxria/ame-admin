import { Badge, Button, Checkbox, Select, Stack, TextInput } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel, ToolbarSurface } from "../components/design-system"

export const Route = createFileRoute("/_admin/examples/table")({
  component: TableDemoRoute,
})

function TableDemoRoute() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [archived, setArchived] = useState<number[]>([])
  const rows = [
    { id: 1, name: t("permissionsRefactor"), owner: "Lucy", status: "running", progress: "72%" },
    { id: 2, name: t("notificationsDesign"), owner: "Ning", status: "review", progress: "48%" },
    { id: 3, name: t("componentLibraryUpgrade"), owner: "Zheng", status: "done", progress: "100%" },
  ] as const
  const statusLabels = { running: t("running"), review: t("reviewing"), done: t("done") }
  const visible = rows.filter(
    (row) =>
      !archived.includes(row.id) &&
      (!status || row.status === status) &&
      `${row.name} ${row.owner}`.toLowerCase().includes(keyword.trim().toLowerCase()),
  )
  const someSelected = visible.some((row) => selected.includes(row.id))
  const allSelected = visible.length > 0 && visible.every((row) => selected.includes(row.id))

  return (
    <Stack gap="lg">
      <PageHeader title={t("tableDemo")} description={t("tableDescription")} />
      <SectionPanel
        title={t("tableDemo")}
        actions={
          <ToolbarSurface>
            <TextInput
              type="search"
              aria-label={t("searchProject")}
              placeholder={t("searchProject")}
              value={keyword}
              onChange={(event) => setKeyword(event.currentTarget.value)}
            />
            <Button
              variant="default"
              onClick={() => {
                setKeyword("")
                setStatus(null)
                setSelected([])
                setArchived([])
              }}
            >
              {t("reset")}
            </Button>
            <Button
              variant="default"
              disabled={!someSelected}
              onClick={() => {
                setArchived((ids) => [
                  ...ids,
                  ...visible.filter((row) => selected.includes(row.id)).map((row) => row.id),
                ])
                setSelected([])
              }}
            >
              {t("bulkArchive")}
            </Button>
            <Button>{t("createProject")}</Button>
          </ToolbarSurface>
        }
      >
        <DataTable
          rows={visible}
          columns={[
            {
              key: "selection",
              header: (
                <Checkbox
                  aria-label={t("selectAll")}
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  disabled={!visible.length}
                  onChange={(event) => {
                    const visibleIds = new Set<number>(visible.map((row) => row.id))
                    const outside = selected.filter((id) => !visibleIds.has(id))
                    setSelected(event.currentTarget.checked ? [...outside, ...visibleIds] : outside)
                  }}
                />
              ),
              width: 50,
              cell: (row) => (
                <Checkbox
                  aria-label={t("selectRow", { name: row.name })}
                  checked={selected.includes(row.id)}
                  onChange={(event) =>
                    setSelected(
                      event.currentTarget.checked
                        ? [...selected, row.id]
                        : selected.filter((id) => id !== row.id),
                    )
                  }
                />
              ),
            },
            { key: "project", header: t("project"), cell: (row) => row.name },
            { key: "owner", header: t("owner"), cell: (row) => row.owner },
            {
              key: "status",
              header: (
                <Select
                  aria-label={t("status")}
                  placeholder={t("status")}
                  clearable
                  clearButtonProps={{ "aria-label": t("clear") }}
                  data={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                  value={status}
                  onChange={setStatus}
                />
              ),
              width: 150,
              cell: (row) => (
                <Badge variant="light" color={row.status === "done" ? "green" : "blue"}>
                  {statusLabels[row.status]}
                </Badge>
              ),
            },
            { key: "progress", header: t("progress"), cell: (row) => row.progress },
            {
              key: "actions",
              header: t("operation"),
              pinRight: true,
              cell: () => <Button variant="subtle">{t("details")}</Button>,
            },
          ]}
        />
      </SectionPanel>
    </Stack>
  )
}
