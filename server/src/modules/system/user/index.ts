import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { idParams, okResponse } from "@/lib/model"
import { systemPermissionMacro } from "../rbac/service"
import { userModels } from "./model"
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  revokeUserSessions,
  updateUser,
} from "./service"

export const userRoutes = new Elysia({ name: "system.users", prefix: "/users" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(userModels)
  .get("/", ({ query }) => listUsers(query), {
    auth: true,
    menu: "/system/users",
    query: "System.UsersQuery",
  })
  .post(
    "/",
    async ({ body, user: currentUser, status }) => {
      const result = await createUser(body, currentUser)

      return "error" in result ? status(400, { message: result.error }) : result
    },
    {
      auth: true,
      menu: { paths: "/system/users", action: "create" },
      body: "System.CreateUserBody",
    },
  )
  .patch(
    "/:id",
    ({ body, params, user: currentUser }) => updateUser(params.id, body, currentUser),
    {
      auth: true,
      body: "System.UpdateUserBody",
      menu: { paths: "/system/users", action: "update" },
      params: idParams,
      response: okResponse,
    },
  )
  .delete(
    "/:id",
    async ({ params, user: currentUser, status }) => {
      const result = await deleteUser(params.id, currentUser)

      return "error" in result ? status(400, { message: result.error }) : result
    },
    { auth: true, menu: { paths: "/system/users", action: "delete" }, params: idParams },
  )
  .post(
    "/:id/reset-password",
    async ({ body, params, user: currentUser, status }) => {
      const result = await resetUserPassword(params.id, body, currentUser)

      return "error" in result ? status(400, { message: result.error }) : result
    },
    {
      auth: true,
      menu: { paths: "/system/users", action: "update" },
      params: idParams,
      body: "System.ResetPasswordBody",
    },
  )
  .post(
    "/:id/revoke-sessions",
    ({ params, user: currentUser }) => revokeUserSessions(params.id, currentUser),
    {
      auth: true,
      menu: { paths: "/system/users", action: "update" },
      params: idParams,
      response: okResponse,
    },
  )
