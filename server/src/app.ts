import { cors } from "@elysiajs/cors"
import { Elysia } from "elysia"
import { authPlugin } from "./lib/auth"
import { env } from "./lib/env"
import { aiRoutes } from "./modules/ai"
import { systemRoutes } from "./modules/system"

const apiRoutes = new Elysia({ name: "api", prefix: "/api" })
  .use(aiRoutes)
  .use(systemRoutes)
  .get("/", () => ({ ok: true, service: "ame-admin-api" }))
  .get("/health", () => ({ ok: true }))
  .get(
    "/me",
    ({ user, session }) => ({
      user,
      session,
    }),
    { auth: true },
  )

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(authPlugin)
  .use(apiRoutes)

export type App = typeof app
