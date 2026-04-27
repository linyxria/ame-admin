import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Elysia } from 'elysia'
import { db } from '../db'
import { schema } from '../db/schema'
import { env } from './env'

type CreateAuthOptions = {
  disableSignUp?: boolean
}

export const createAuth = ({ disableSignUp = true }: CreateAuthOptions = {}) =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.CORS_ORIGIN],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp,
    },
  })

export const auth = createAuth()

export const authMacro = new Elysia({ name: 'auth-macro' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers })

      if (!session) {
        return status(401, { message: 'Unauthorized' })
      }

      return {
        user: session.user,
        session: session.session,
      }
    },
  },
})

export const authPlugin = new Elysia({ name: 'auth' }).mount(auth.handler).use(authMacro)
