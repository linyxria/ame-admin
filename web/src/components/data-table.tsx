import { Alert, Center, Group, Loader, NativeSelect, Pagination, Table, Text } from "@mantine/core"
import { type ReactNode, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { getRequestErrorMessage } from "../lib/request-notification"

type Column<Row> = {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  width?: number
  pinRight?: boolean
}

type Page = {
  page: number
  pageSize: number
  total: number | undefined
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function DataTable<Row extends { id: string | number }>({
  rows,
  columns,
  loading = false,
  error,
  pagination,
}: {
  rows: readonly Row[]
  columns: Column<Row>[]
  loading?: boolean
  error?: Error | null
  pagination?: Page
}) {
  const { t } = useTranslation()
  const [localPage, setLocalPage] = useState(1)
  const pageSize = pagination?.pageSize ?? 10
  const total = pagination ? pagination.total : rows.length
  const pageCount = Math.max(1, Math.ceil((total ?? 0) / pageSize))
  const requestedPage = pagination?.page ?? localPage
  const page = total === undefined ? requestedPage : Math.min(requestedPage, pageCount)
  const setPage = pagination?.onPageChange ?? setLocalPage
  const visibleRows = pagination ? rows : rows.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page !== requestedPage) {
      setPage(page)
    }
  }, [page, requestedPage, setPage])

  return (
    <>
      {error && (
        <Alert color="red" role="alert" mb="sm">
          {getRequestErrorMessage(error, t("requestFailed"))}
        </Alert>
      )}
      <Table.ScrollContainer minWidth={560} type="native">
        <Table highlightOnHover aria-busy={loading}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  scope="col"
                  w={column.width}
                  className={column.pinRight ? "ame-table-pin-right" : undefined}
                >
                  {column.header}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleRows.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((column) => (
                  <Table.Td
                    key={column.key}
                    className={column.pinRight ? "ame-table-pin-right" : undefined}
                  >
                    {column.cell(row)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
            {visibleRows.length === 0 && !error && (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center py="xl">
                    {loading ? (
                      <Loader size="sm" aria-label={t("loading")} />
                    ) : (
                      <Text c="dimmed" size="sm">
                        {t("noData")}
                      </Text>
                    )}
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {(pagination || pageCount > 1) && (
        <Group justify="flex-end" gap="sm" mt="md">
          {pagination && (
            <NativeSelect
              aria-label={t("rowsPerPage")}
              data={[10, 20, 50, 100].map((size) => ({
                value: String(size),
                label: t("rowsPerPageOption", { count: size }),
              }))}
              value={pageSize}
              onChange={(event) => pagination.onPageSizeChange(Number(event.currentTarget.value))}
            />
          )}
          <Pagination
            total={pageCount}
            value={page}
            onChange={setPage}
            withControls={pageCount > 1}
            getItemProps={(number) => ({ "aria-label": t("pageNumber", { number }) })}
            getControlProps={(control) => ({
              "aria-label": control === "previous" ? t("previousPage") : t("nextPage"),
            })}
          />
        </Group>
      )}
    </>
  )
}
