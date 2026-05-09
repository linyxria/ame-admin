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

export function updateProfileMutationOptions() {
  return mutationOptions({
    mutationFn: (body: ProfileInput) => api.admin.profile.patch(body),
  })
}

export function createUserMutationOptions() {
  return mutationOptions({
    mutationFn: (body: CreateUserInput) => api.admin.users.post(body),
  })
}

export function updateUserMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateUserVariables) => api.admin.users({ id }).patch(body),
  })
}

export function deleteUserMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.users({ id }).delete(),
  })
}

export function resetUserPasswordMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, nextPassword }: ResetUserPasswordVariables) =>
      api.admin.users({ id })["reset-password"].post({ password: nextPassword }),
  })
}

export function revokeUserSessionsMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.users({ id })["revoke-sessions"].post(),
  })
}

export function createRoleMutationOptions() {
  return mutationOptions({
    mutationFn: (body: RoleInput) => api.admin.roles.post(body),
  })
}

export function updateRoleMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateRoleVariables) => api.admin.roles({ id }).patch(body),
  })
}

export function deleteRoleMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.roles({ id }).delete(),
  })
}

export function createMenuMutationOptions() {
  return mutationOptions({
    mutationFn: (body: MenuInput) => api.admin.menus.post(body),
  })
}

export function updateMenuMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateMenuVariables) => api.admin.menus({ id }).patch(body),
  })
}

export function deleteMenuMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.menus({ id }).delete(),
  })
}

export function updateSettingsMutationOptions() {
  return mutationOptions({
    mutationFn: (body: SettingsInput) => api.admin.settings.put(body),
  })
}

export function readNotificationMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.notifications({ id }).read.post(),
  })
}

export function readAllNotificationsMutationOptions() {
  return mutationOptions({
    mutationFn: () => api.admin.notifications["read-all"].post(),
  })
}

export function deleteNotificationMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.admin.notifications({ id }).delete(),
  })
}
