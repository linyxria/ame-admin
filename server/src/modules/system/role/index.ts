import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { idParams, okResponse } from "@/lib/model"
import { systemPermissionMacro } from "../rbac/service"
import { roleModels } from "./model"
import { createRole, deleteRole, listRoles, updateRole } from "./service"

export const roleRoutes = new Elysia({ name: "system.roles", prefix: "/roles" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(roleModels)
  .get("/", () => listRoles(), { auth: true, menu: ["/system/roles", "/system/users"] })
  .post("/", ({ body, user: currentUser }) => createRole(body, currentUser), {
    auth: true,
    menu: { paths: "/system/roles", action: "create" },
    body: "System.RoleBody",
  })
  .patch(
    "/:id",
    ({ body, params, user: currentUser }) => updateRole(params.id, body, currentUser),
    {
      auth: true,
      menu: { paths: "/system/roles", action: "update" },
      params: idParams,
      body: "System.RoleBody",
      response: okResponse,
    },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      const result = await deleteRole(params.id, currentUser)

      return "error" in result ? status(400, { message: result.error }) : result
    },
    { auth: true, menu: { paths: "/system/roles", action: "delete" }, params: idParams },
  )
