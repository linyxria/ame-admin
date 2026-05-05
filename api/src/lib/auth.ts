import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { eq } from "drizzle-orm"
import { Elysia } from "elysia"
import { db } from "@/db"
import { schema, user } from "@/db/schema"
import { env } from "./env"

type CreateAuthOptions = {
  disableSignUp?: boolean
}

export const createAuth = ({ disableSignUp = true }: CreateAuthOptions = {}) =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CORS_ORIGIN],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp,
    },
  })

export const auth = createAuth()

export const authMacro = new Elysia({ name: "auth-macro" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers })

      if (!session) {
        return status(401, { message: "Unauthorized" })
      }

      const [currentUser] = await db
        .select({ enabled: user.enabled })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)

      if (!currentUser?.enabled) {
        return status(403, { message: "账号已停用" })
      }

      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})

export const authPlugin = new Elysia({ name: "auth" }).mount(auth.handler).use(authMacro)
