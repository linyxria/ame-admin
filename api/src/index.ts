import { app } from "./app"
import { env } from "./lib/env"

app.listen(env.PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
