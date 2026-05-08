import i18n from "../i18n"
import { api } from "./api"

type QueryData<T extends (...args: never[]) => Promise<{ data: unknown }>> = NonNullable<
  Awaited<ReturnType<T>>["data"]
>

const unwrap = async <T>(response: Promise<{ data: T; error: unknown }>) => {
  const { data, error } = await response

  if (error) {
    const status =
      typeof error === "object" && error && "status" in error && typeof error.status === "number"
        ? error.status
        : undefined
    const message =
      typeof error === "object" && error && "message" in error && typeof error.message === "string"
        ? error.message
        : i18n.t("requestFailed")

    if (status === 401 && globalThis.location.pathname !== "/login") {
      const redirect = `${globalThis.location.pathname}${globalThis.location.search}`
      globalThis.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    if (status === 403 && globalThis.location.pathname !== "/forbidden") {
      globalThis.location.assign("/forbidden")
    }

    throw new Error(message)
  }

  return data
}

export type Overview = QueryData<typeof api.admin.overview.get>
export type Role = QueryData<typeof api.admin.roles.get>[number]
export type Menu = QueryData<typeof api.admin.menus.get>[number]
export type SystemUser = QueryData<typeof api.admin.users.get>["items"][number]
export type AuditLog = QueryData<(typeof api.admin)["audit-logs"]["get"]>["items"][number]
export type NotificationItem = QueryData<typeof api.admin.notifications.get>["items"][number]
export type SystemSetting = QueryData<typeof api.admin.settings.get>[number]
export type MyPermission = QueryData<(typeof api.admin)["my-permissions"]["get"]>[number]

export type CreateUserInput = Parameters<typeof api.admin.users.post>[0]
export type UpdateUserInput = Parameters<ReturnType<typeof api.admin.users>["patch"]>[0]
export type RoleInput = Parameters<typeof api.admin.roles.post>[0]
export type MenuInput = Parameters<typeof api.admin.menus.post>[0]
export type ProfileInput = Parameters<typeof api.admin.profile.patch>[0]
export type SettingsInput = Parameters<typeof api.admin.settings.put>[0]

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

export const systemApi = {
  overview: () => unwrap(api.admin.overview.get()),
  updateProfile: (body: ProfileInput) => unwrap(api.admin.profile.patch(body)),
  users: (params?: ListParams) => unwrap(api.admin.users.get({ query: listQuery(params) })),
  createUser: (body: CreateUserInput) => unwrap(api.admin.users.post(body)),
  updateUser: (id: string, body: UpdateUserInput) => unwrap(api.admin.users({ id }).patch(body)),
  deleteUser: (id: string) => unwrap(api.admin.users({ id }).delete()),
  resetUserPassword: (id: string, password: string) =>
    unwrap(api.admin.users({ id })["reset-password"].post({ password })),
  revokeUserSessions: (id: string) => unwrap(api.admin.users({ id })["revoke-sessions"].post()),

  roles: () => unwrap(api.admin.roles.get()),
  createRole: (body: RoleInput) => unwrap(api.admin.roles.post(body)),
  updateRole: (id: string, body: RoleInput) => unwrap(api.admin.roles({ id }).patch(body)),
  deleteRole: (id: string) => unwrap(api.admin.roles({ id }).delete()),

  menus: () => unwrap(api.admin.menus.get()),
  myMenus: () => unwrap(api.admin["my-menus"].get()),
  myPermissions: () => unwrap(api.admin["my-permissions"].get()),
  createMenu: (body: MenuInput) => unwrap(api.admin.menus.post(body)),
  updateMenu: (id: string, body: MenuInput) => unwrap(api.admin.menus({ id }).patch(body)),
  deleteMenu: (id: string) => unwrap(api.admin.menus({ id }).delete()),

  auditLogs: (params?: ListParams) =>
    unwrap(api.admin["audit-logs"].get({ query: listQuery(params) })),

  notifications: (params?: NotificationListParams) =>
    unwrap(
      api.admin.notifications.get({
        query: {
          ...listQuery(params),
          type: params?.type || undefined,
          read: params?.read,
        },
      }),
    ),
  readNotification: (id: string) => unwrap(api.admin.notifications({ id }).read.post()),
  readAllNotifications: () => unwrap(api.admin.notifications["read-all"].post()),
  deleteNotification: (id: string) => unwrap(api.admin.notifications({ id }).delete()),

  settings: () => unwrap(api.admin.settings.get()),
  updateSettings: (body: SettingsInput) => unwrap(api.admin.settings.put(body)),
}

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
