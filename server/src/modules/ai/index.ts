import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { systemPermissionMacro } from "@/modules/system/rbac/service"
import { aiModels } from "./model"
import { createChatStream, isAiConfigured } from "./service"

export const aiRoutes = new Elysia({ name: "ai", prefix: "/ai" })
  .use(authMacro)
  .use(systemPermissionMacro)
  .model(aiModels)
  .post(
    "/chat",
    ({ body, status }) => {
      if (!isAiConfigured()) {
        return status(503, { message: "AI_API_KEY is not configured." })
      }

      return createChatStream(body)
    },
    { auth: true, menu: "/ai", body: "Ai.ChatBody" },
  )
