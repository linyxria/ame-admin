import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { okResponse } from "@/lib/model"
import { systemPermissionMacro } from "../rbac/service"
import { settingModels } from "./model"
import { listSettings, updateSettings } from "./service"

export const settingRoutes = new Elysia({ name: "system.settings", prefix: "/settings" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(settingModels)
  .get("/", () => listSettings(), { auth: true })
  .put("/", ({ body, user: currentUser }) => updateSettings(body, currentUser), {
    auth: true,
    menu: { paths: "/system/settings", action: "update" },
    body: "System.SettingsBody",
    response: okResponse,
  })
