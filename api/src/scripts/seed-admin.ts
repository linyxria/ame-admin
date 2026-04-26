import { eq } from 'drizzle-orm'
import { db, pool } from '../db'
import { user } from '../db/schema'
import { createAuth } from '../lib/auth'

const email = process.env.ADMIN_EMAIL ?? 'admin@example.com'
const password = process.env.ADMIN_PASSWORD ?? 'admin123456'
const name = process.env.ADMIN_NAME ?? '系统管理员'

if (password.length < 8) {
  throw new Error('ADMIN_PASSWORD must be at least 8 characters.')
}

const existing = await db
  .select({ id: user.id, email: user.email })
  .from(user)
  .where(eq(user.email, email))
  .limit(1)

if (existing[0]) {
  console.log(`Admin user already exists: ${email}`)
  await pool.end()
  process.exit(0)
}

const seedAuth = createAuth({ disableSignUp: false })

await seedAuth.api.signUpEmail({
  body: {
    name,
    email,
    password,
    rememberMe: false,
  },
})

console.log(`Admin user created: ${email}`)
await pool.end()
