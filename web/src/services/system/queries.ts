import { queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"

const CURRENT_USER_STALE_TIME = 60_000

type QueryData<T extends (...args: never[]) => Promise<unknown>> = NonNullable<
  Awaited<ReturnType<T>>
>

export type Role = QueryData<typeof api.system.roles.get>[number]
export type Menu = QueryData<typeof api.system.menus.get>[number]
export type SystemUser = QueryData<typeof api.system.users.get>["items"][number]
export type AuditLog = QueryData<(typeof api.system)["audit-logs"]["get"]>["items"][number]
export type NotificationItem = QueryData<typeof api.system.notifications.get>["items"][number]
export type SystemSetting = QueryData<typeof api.system.settings.get>[number]

export type ListParams = {
  page?: number
  pageSize?: number
  keyword?: string
}

export type NotificationListParams = ListParams & {
  type?: string
  read?: "read" | "unread"
}

function listQuery(params?: ListParams) {
  return {
    page: params?.page ? String(params.page) : undefined,
    pageSize: params?.pageSize ? String(params.pageSize) : undefined,
    keyword: params?.keyword || undefined,
  }
}

export const usersQueryPrefixKey = ["system", "users"] as const
export const rolesQueryKey = ["system", "roles"] as const
export const menusQueryKey = ["system", "menus"] as const
export const currentUserMenusQueryKey = ["system", "current-user-menus"] as const
export const currentUserPermissionsQueryKey = ["system", "current-user-permissions"] as const
export const auditLogsQueryPrefixKey = ["system", "audit-logs"] as const
export const notificationsQueryPrefixKey = ["system", "notifications"] as const
export const settingsQueryKey = ["system", "settings"] as const

export function usersQueryKey(params?: ListParams) {
  return [
    ...usersQueryPrefixKey,
    params?.page ?? 1,
    params?.pageSize ?? 20,
    params?.keyword ?? "",
  ] as const
}

export function auditLogsQueryKey(params?: ListParams) {
  return [
    ...auditLogsQueryPrefixKey,
    params?.page ?? 1,
    params?.pageSize ?? 20,
    params?.keyword ?? "",
  ] as const
}

export function notificationsQueryKey(params?: NotificationListParams) {
  return [
    ...notificationsQueryPrefixKey,
    params?.page ?? 1,
    params?.pageSize ?? 20,
    params?.keyword ?? "",
    params?.type ?? "",
    params?.read ?? "",
  ] as const
}

export function usersQueryOptions(params?: ListParams) {
  return queryOptions({
    queryKey: usersQueryKey(params),
    queryFn: () => api.system.users.get({ query: listQuery(params) }),
  })
}

export function rolesQueryOptions() {
  return queryOptions({
    queryKey: rolesQueryKey,
    queryFn: () => api.system.roles.get(),
  })
}

export function menusQueryOptions() {
  return queryOptions({
    queryKey: menusQueryKey,
    queryFn: () => api.system.menus.get(),
  })
}

export function currentUserMenusQueryOptions() {
  return queryOptions({
    queryKey: currentUserMenusQueryKey,
    queryFn: () => api.system.me.menus.get(),
    staleTime: CURRENT_USER_STALE_TIME,
  })
}

export function currentUserPermissionsQueryOptions() {
  return queryOptions({
    queryKey: currentUserPermissionsQueryKey,
    queryFn: () => api.system.me.permissions.get(),
    staleTime: CURRENT_USER_STALE_TIME,
  })
}

export function auditLogsQueryOptions(params?: ListParams) {
  return queryOptions({
    queryKey: auditLogsQueryKey(params),
    queryFn: () => api.system["audit-logs"].get({ query: listQuery(params) }),
  })
}

export function notificationsQueryOptions(params?: NotificationListParams) {
  return queryOptions({
    queryKey: notificationsQueryKey(params),
    queryFn: () =>
      api.system.notifications.get({
        query: {
          ...listQuery(params),
          type: params?.type || undefined,
          read: params?.read,
        },
      }),
  })
}

export function settingsQueryOptions() {
  return queryOptions({
    queryKey: settingsQueryKey,
    queryFn: () => api.system.settings.get(),
  })
}
