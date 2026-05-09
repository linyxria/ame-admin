import { t } from "elysia"

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export const paginationQuery = {
  page: t.Optional(t.String()),
  pageSize: t.Optional(t.String()),
  keyword: t.Optional(t.String()),
}

export function parsePagination(query: { page?: string; pageSize?: string }) {
  const page = Math.max(Number.parseInt(query.page ?? "", 10) || DEFAULT_PAGE, 1)
  const requestedPageSize = Number.parseInt(query.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE
  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_PAGE_SIZE)

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  }
}

export function paginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
  }
}
