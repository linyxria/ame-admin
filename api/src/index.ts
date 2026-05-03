import { cors } from "@elysiajs/cors"
import { Elysia } from "elysia"
import { auth, authPlugin } from "./lib/auth"
import { env } from "./lib/env"
import { systemRoutes } from "./routes/system"

const app = new Elysia()
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
  .listen(env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
export { auth }
