import { Elysia } from "elysia"
import { auditLogRoutes } from "./audit-log"
import { currentUserMenuRoutes, menuRoutes } from "./menu"
import { notificationRoutes } from "./notification"
import { overviewRoutes } from "./overview"
import { profileRoutes } from "./profile"
import { roleRoutes } from "./role"
import { settingRoutes } from "./setting"
import { userRoutes } from "./user"

export const systemRoutes = new Elysia({ name: "system", prefix: "/system" })
  .use(overviewRoutes)
  .use(profileRoutes)
  .use(userRoutes)
  .use(roleRoutes)
  .use(menuRoutes)
  .use(currentUserMenuRoutes)
  .use(auditLogRoutes)
  .use(notificationRoutes)
  .use(settingRoutes)
