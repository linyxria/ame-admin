import 'dotenv/config'

const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const requiredEnv = (key: (typeof required)[number]) => {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: requiredEnv('DATABASE_URL'),
  BETTER_AUTH_SECRET: requiredEnv('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: requiredEnv('BETTER_AUTH_URL'),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
