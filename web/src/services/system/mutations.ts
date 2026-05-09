import { mutationOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"

export type CreateUserInput = Parameters<typeof api.system.users.post>[0]
export type UpdateUserInput = Parameters<ReturnType<typeof api.system.users>["patch"]>[0]
export type RoleInput = Parameters<typeof api.system.roles.post>[0]
export type MenuInput = Parameters<typeof api.system.menus.post>[0]
export type ProfileInput = Parameters<typeof api.system.profile.patch>[0]
export type SettingsInput = Parameters<typeof api.system.settings.put>[0]

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
    mutationFn: (body: ProfileInput) => api.system.profile.patch(body),
  })
}

export function createUserMutationOptions() {
  return mutationOptions({
    mutationFn: (body: CreateUserInput) => api.system.users.post(body),
  })
}

export function updateUserMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateUserVariables) => api.system.users({ id }).patch(body),
  })
}

export function deleteUserMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.users({ id }).delete(),
  })
}

export function resetUserPasswordMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, nextPassword }: ResetUserPasswordVariables) =>
      api.system.users({ id })["reset-password"].post({ password: nextPassword }),
  })
}

export function revokeUserSessionsMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.users({ id })["revoke-sessions"].post(),
  })
}

export function createRoleMutationOptions() {
  return mutationOptions({
    mutationFn: (body: RoleInput) => api.system.roles.post(body),
  })
}

export function updateRoleMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateRoleVariables) => api.system.roles({ id }).patch(body),
  })
}

export function deleteRoleMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.roles({ id }).delete(),
  })
}

export function createMenuMutationOptions() {
  return mutationOptions({
    mutationFn: (body: MenuInput) => api.system.menus.post(body),
  })
}

export function updateMenuMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, body }: UpdateMenuVariables) => api.system.menus({ id }).patch(body),
  })
}

export function deleteMenuMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.menus({ id }).delete(),
  })
}

export function updateSettingsMutationOptions() {
  return mutationOptions({
    mutationFn: (body: SettingsInput) => api.system.settings.put(body),
  })
}

export function readNotificationMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.notifications({ id }).read.post(),
  })
}

export function readAllNotificationsMutationOptions() {
  return mutationOptions({
    mutationFn: () => api.system.notifications["read-all"].post(),
  })
}

export function deleteNotificationMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => api.system.notifications({ id }).delete(),
  })
}
