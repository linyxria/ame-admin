import { api } from './api'

type QueryData<T extends (...args: never[]) => Promise<{ data: unknown }>> = NonNullable<
  Awaited<ReturnType<T>>['data']
>

const unwrap = async <T>(response: Promise<{ data: T; error: unknown }>) => {
  const { data, error } = await response

  if (error) {
    const message =
      typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
        ? error.message
        : '请求失败'
    throw new Error(message)
  }

  return data
}

export type Overview = QueryData<typeof api.admin.overview.get>
export type Role = QueryData<typeof api.admin.roles.get>[number]
export type Menu = QueryData<typeof api.admin.menus.get>[number]
export type SystemUser = QueryData<typeof api.admin.users.get>[number]

export type CreateUserInput = Parameters<typeof api.admin.users.post>[0]
export type UpdateUserInput = Parameters<ReturnType<typeof api.admin.users>['patch']>[0]
export type RoleInput = Parameters<typeof api.admin.roles.post>[0]
export type MenuInput = Parameters<typeof api.admin.menus.post>[0]
export type ProfileInput = Parameters<typeof api.admin.profile.patch>[0]

export const systemApi = {
  overview: () => unwrap(api.admin.overview.get()),
  updateProfile: (body: ProfileInput) => unwrap(api.admin.profile.patch(body)),
  users: () => unwrap(api.admin.users.get()),
  createUser: (body: CreateUserInput) => unwrap(api.admin.users.post(body)),
  updateUser: (id: string, body: UpdateUserInput) => unwrap(api.admin.users({ id }).patch(body)),
  deleteUser: (id: string) => unwrap(api.admin.users({ id }).delete()),

  roles: () => unwrap(api.admin.roles.get()),
  createRole: (body: RoleInput) => unwrap(api.admin.roles.post(body)),
  updateRole: (id: string, body: RoleInput) => unwrap(api.admin.roles({ id }).patch(body)),
  deleteRole: (id: string) => unwrap(api.admin.roles({ id }).delete()),

  menus: () => unwrap(api.admin.menus.get()),
  myMenus: () => unwrap(api.admin['my-menus'].get()),
  createMenu: (body: MenuInput) => unwrap(api.admin.menus.post(body)),
  updateMenu: (id: string, body: MenuInput) => unwrap(api.admin.menus({ id }).patch(body)),
  deleteMenu: (id: string) => unwrap(api.admin.menus({ id }).delete()),
}

export const systemQueryKeys = {
  overview: ['system', 'overview'] as const,
  users: ['system', 'users'] as const,
  roles: ['system', 'roles'] as const,
  menus: ['system', 'menus'] as const,
  myMenus: ['system', 'my-menus'] as const,
}
