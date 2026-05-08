import { queryOptions } from "@tanstack/react-query"
import { api } from "../../lib/api"

type QueryData<T extends (...args: never[]) => Promise<unknown>> = NonNullable<
  Awaited<ReturnType<T>>
>

export type Overview = QueryData<typeof api.admin.overview.get>
export type Role = QueryData<typeof api.admin.roles.get>[number]
export type Menu = QueryData<typeof api.admin.menus.get>[number]
export type SystemUser = QueryData<typeof api.admin.users.get>["items"][number]
export type AuditLog = QueryData<(typeof api.admin)["audit-logs"]["get"]>["items"][number]
export type NotificationItem = QueryData<typeof api.admin.notifications.get>["items"][number]
export type SystemSetting = QueryData<typeof api.admin.settings.get>[number]

export type ListParams = {
  page?: number
  pageSize?: number
  keyword?: string
}

export type NotificationListParams = ListParams & {
  type?: string
  read?: "read" | "unread"
}

const listQuery = (params?: ListParams) => ({
  page: params?.page ? String(params.page) : undefined,
  pageSize: params?.pageSize ? String(params.pageSize) : undefined,
  keyword: params?.keyword || undefined,
})

export const systemQueryKeys = {
  overview: ["system", "overview"] as const,
  users: (params?: ListParams) =>
    ["system", "users", params?.page ?? 1, params?.pageSize ?? 20, params?.keyword ?? ""] as const,
  roles: ["system", "roles"] as const,
  menus: ["system", "menus"] as const,
  myMenus: ["system", "my-menus"] as const,
  myPermissions: ["system", "my-permissions"] as const,
  auditLogs: (params?: ListParams) =>
    [
      "system",
      "audit-logs",
      params?.page ?? 1,
      params?.pageSize ?? 20,
      params?.keyword ?? "",
    ] as const,
  notifications: (params?: NotificationListParams) =>
    [
      "system",
      "notifications",
      params?.page ?? 1,
      params?.pageSize ?? 20,
      params?.keyword ?? "",
      params?.type ?? "",
      params?.read ?? "",
    ] as const,
  settings: ["system", "settings"] as const,
}

export const overviewQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.overview,
    queryFn: () => api.admin.overview.get(),
  })

export const usersQueryOptions = (params?: ListParams) =>
  queryOptions({
    queryKey: systemQueryKeys.users(params),
    queryFn: () => api.admin.users.get({ query: listQuery(params) }),
  })

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.roles,
    queryFn: () => api.admin.roles.get(),
  })

export const menusQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.menus,
    queryFn: () => api.admin.menus.get(),
  })

export const myMenusQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.myMenus,
    queryFn: () => api.admin["my-menus"].get(),
  })

export const myPermissionsQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.myPermissions,
    queryFn: () => api.admin["my-permissions"].get(),
  })

export const auditLogsQueryOptions = (params?: ListParams) =>
  queryOptions({
    queryKey: systemQueryKeys.auditLogs(params),
    queryFn: () => api.admin["audit-logs"].get({ query: listQuery(params) }),
  })

export const notificationsQueryOptions = (params?: NotificationListParams) =>
  queryOptions({
    queryKey: systemQueryKeys.notifications(params),
    queryFn: () =>
      api.admin.notifications.get({
        query: {
          ...listQuery(params),
          type: params?.type || undefined,
          read: params?.read,
        },
      }),
  })

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: systemQueryKeys.settings,
    queryFn: () => api.admin.settings.get(),
  })
