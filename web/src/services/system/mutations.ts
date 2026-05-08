import { mutationOptions } from "@tanstack/react-query"
import { api } from "../../lib/api"

export type CreateUserInput = Parameters<typeof api.admin.users.post>[0]
export type UpdateUserInput = Parameters<ReturnType<typeof api.admin.users>["patch"]>[0]
export type RoleInput = Parameters<typeof api.admin.roles.post>[0]
export type MenuInput = Parameters<typeof api.admin.menus.post>[0]
export type ProfileInput = Parameters<typeof api.admin.profile.patch>[0]
export type SettingsInput = Parameters<typeof api.admin.settings.put>[0]

type UpdateUserVariables = {
  id: string
  body: UpdateUserInput
}

type ResetUserPasswordVariables = {
  id: string
  nextPassword: string
}

type UpdateRoleVariables = {
  id: string
  body: RoleInput
}

type UpdateMenuVariables = {
  id: string
  body: MenuInput
}

export const updateProfileMutationOptions = () =>
  mutationOptions({
    mutationFn: (body: ProfileInput) => api.admin.profile.patch(body),
  })

export const createUserMutationOptions = () =>
  mutationOptions({
    mutationFn: (body: CreateUserInput) => api.admin.users.post(body),
  })

export const updateUserMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ id, body }: UpdateUserVariables) => api.admin.users({ id }).patch(body),
  })

export const deleteUserMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.users({ id }).delete(),
  })

export const resetUserPasswordMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ id, nextPassword }: ResetUserPasswordVariables) =>
      api.admin.users({ id })["reset-password"].post({ password: nextPassword }),
  })

export const revokeUserSessionsMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.users({ id })["revoke-sessions"].post(),
  })

export const createRoleMutationOptions = () =>
  mutationOptions({
    mutationFn: (body: RoleInput) => api.admin.roles.post(body),
  })

export const updateRoleMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ id, body }: UpdateRoleVariables) => api.admin.roles({ id }).patch(body),
  })

export const deleteRoleMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.roles({ id }).delete(),
  })

export const createMenuMutationOptions = () =>
  mutationOptions({
    mutationFn: (body: MenuInput) => api.admin.menus.post(body),
  })

export const updateMenuMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ id, body }: UpdateMenuVariables) => api.admin.menus({ id }).patch(body),
  })

export const deleteMenuMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.menus({ id }).delete(),
  })

export const updateSettingsMutationOptions = () =>
  mutationOptions({
    mutationFn: (body: SettingsInput) => api.admin.settings.put(body),
  })

export const readNotificationMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.notifications({ id }).read.post(),
  })

export const readAllNotificationsMutationOptions = () =>
  mutationOptions({
    mutationFn: () => api.admin.notifications["read-all"].post(),
  })

export const deleteNotificationMutationOptions = () =>
  mutationOptions({
    mutationFn: (id: string) => api.admin.notifications({ id }).delete(),
  })
