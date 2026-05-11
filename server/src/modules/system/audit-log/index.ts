import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { systemPermissionMacro } from "../rbac/service"
import { auditLogModels } from "./model"
import { listAuditLogs } from "./service"

export const auditLogRoutes = new Elysia({ name: "system.audit-logs", prefix: "/audit-logs" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(auditLogModels)
  .get("/", ({ query }) => listAuditLogs(query), {
    auth: true,
    menu: "/system/audit-logs",
    query: "System.AuditLogsQuery",
  })
