import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { idParams, okResponse } from "@/lib/model"
import { systemPermissionMacro } from "../rbac/service"
import { menuModels } from "./model"
import {
  createMenu,
  deleteMenu,
  listCurrentUserMenus,
  listCurrentUserPermissions,
  listMenus,
  updateMenu,
} from "./service"

export const menuRoutes = new Elysia({ name: "system.menus", prefix: "/menus" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(menuModels)
  .get("/", () => listMenus(), { auth: true, menu: ["/system/menus", "/system/roles"] })
  .post("/", ({ body, user: currentUser }) => createMenu(body, currentUser), {
    auth: true,
    menu: { paths: "/system/menus", action: "create" },
    body: "System.MenuBody",
  })
  .patch(
    "/:id",
    ({ body, params, user: currentUser }) => updateMenu(params.id, body, currentUser),
    {
      auth: true,
      menu: { paths: "/system/menus", action: "update" },
      params: idParams,
      body: "System.MenuBody",
      response: okResponse,
    },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      const result = await deleteMenu(params.id, currentUser)

      return "error" in result ? status(400, { message: result.error }) : result
    },
    { auth: true, menu: { paths: "/system/menus", action: "delete" }, params: idParams },
  )

export const currentUserMenuRoutes = new Elysia({
  name: "system.current-user-menus",
  prefix: "/me",
})
  .use(authMacro)
  .get("/menus", ({ user: currentUser }) => listCurrentUserMenus(currentUser.id), { auth: true })
  .get("/permissions", ({ user: currentUser }) => listCurrentUserPermissions(currentUser.id), {
    auth: true,
  })
