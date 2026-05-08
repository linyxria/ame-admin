import { cors } from "@elysiajs/cors"
import { Elysia } from "elysia"
import { authPlugin } from "./lib/auth"
import { env } from "./lib/env"
import { systemRoutes } from "./modules/system"

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

export type App = typeof app
