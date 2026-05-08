import { eq } from "drizzle-orm"
import { db, pool } from "@/db"
import { menu, notification, role, roleMenu, systemSetting, user, userRole } from "@/db/schema"
import { createAuth } from "@/lib/auth"

const email = process.env.ADMIN_EMAIL ?? "admin@example.com"
const password = process.env.ADMIN_PASSWORD ?? "admin123456"
const name = process.env.ADMIN_NAME ?? "系统管理员"
const adminRoleId = "role_admin"
const defaultMenus = [
  {
    id: "menu_system",
    title: "系统设置",
    titleKey: "systemSettings",
    path: "/system",
    icon: "settings",
    sort: 10,
    builtIn: true,
  },
  {
    id: "menu_dashboard",
    title: "控制台",
    titleKey: "dashboard",
    path: "/dashboard",
    icon: "dashboard",
    sort: 0,
  },
  {
    id: "menu_system_users",
    parentId: "menu_system",
    title: "用户管理",
    titleKey: "userManagement",
    path: "/system/users",
    icon: "user",
    sort: 10,
    builtIn: true,
  },
  {
    id: "menu_system_roles",
    parentId: "menu_system",
    title: "角色管理",
    titleKey: "roleManagement",
    path: "/system/roles",
    icon: "team",
    sort: 20,
    builtIn: true,
  },
  {
    id: "menu_system_menus",
    parentId: "menu_system",
    title: "菜单管理",
    titleKey: "menuManagement",
    path: "/system/menus",
    icon: "menu",
    sort: 30,
    builtIn: true,
  },
  {
    id: "menu_system_audit_logs",
    parentId: "menu_system",
    title: "审计日志",
    titleKey: "auditLogs",
    path: "/system/audit-logs",
    icon: "audit",
    sort: 40,
    builtIn: true,
  },
  {
    id: "menu_system_settings",
    parentId: "menu_system",
    title: "系统设置",
    titleKey: "systemSettings",
    path: "/system/settings",
    icon: "settings",
    sort: 50,
    builtIn: true,
  },
  {
    id: "menu_notifications",
    title: "通知中心",
    titleKey: "notificationCenter",
    path: "/notifications",
    icon: "bell",
    sort: 15,
    builtIn: true,
  },
  {
    id: "menu_demos",
    title: "示例",
    titleKey: "demos",
    path: "/demos",
    icon: "demo",
    sort: 20,
    builtIn: true,
  },
  {
    id: "menu_demo_charts",
    parentId: "menu_demos",
    title: "图表示例",
    titleKey: "chartDemo",
    path: "/demos/charts",
    icon: "chart",
    sort: 10,
    builtIn: true,
  },
  {
    id: "menu_demo_table",
    parentId: "menu_demos",
    title: "表格示例",
    titleKey: "tableDemo",
    path: "/demos/table",
    icon: "table",
    sort: 20,
    builtIn: true,
  },
  {
    id: "menu_demo_form",
    parentId: "menu_demos",
    title: "表单示例",
    titleKey: "formDemo",
    path: "/demos/form",
    icon: "form",
    sort: 30,
    builtIn: true,
  },
]

if (password.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters.")
}

const existing = await db
  .select({ id: user.id, email: user.email })
  .from(user)
  .where(eq(user.email, email))
  .limit(1)

await db
  .insert(role)
  .values({
    id: adminRoleId,
    name: "超级管理员",
    code: "admin",
    description: "内置最高权限角色",
    builtIn: true,
  })
  .onConflictDoUpdate({
    target: role.id,
    set: {
      name: "超级管理员",
      code: "admin",
      description: "内置最高权限角色",
      enabled: true,
      builtIn: true,
      updatedAt: new Date(),
    },
  })

for (const item of defaultMenus) {
  await db
    .insert(menu)
    .values(item)
    .onConflictDoUpdate({
      target: menu.id,
      set: {
        parentId: item.parentId ?? null,
        title: item.title,
        titleKey: item.titleKey,
        path: item.path,
        icon: item.icon,
        sort: item.sort,
        visible: true,
        builtIn: item.builtIn ?? false,
        updatedAt: new Date(),
      },
    })
}

await db
  .insert(roleMenu)
  .values(
    defaultMenus.map((item) => ({
      roleId: adminRoleId,
      menuId: item.id,
      actions: "view,create,update,delete",
    })),
  )
  .onConflictDoNothing()

await db
  .insert(systemSetting)
  .values([
    {
      key: "siteName",
      value: "AME 管理后台",
      description: "显示在侧边栏和浏览器标题中的站点名称",
    },
    {
      key: "defaultLanguage",
      value: "en-US",
      description: "新会话默认语言",
    },
    {
      key: "passwordMinLength",
      value: "8",
      description: "后台账号密码最小长度",
    },
    {
      key: "allowPublicSignUp",
      value: "false",
      description: "是否允许公开注册",
    },
  ])
  .onConflictDoNothing()

if (existing[0]) {
  await db
    .update(user)
    .set({ builtIn: true, updatedAt: new Date() })
    .where(eq(user.id, existing[0].id))
  await db
    .insert(userRole)
    .values({ userId: existing[0].id, roleId: adminRoleId })
    .onConflictDoNothing()
  console.log(`Admin user already exists and role is ready: ${email}`)
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

const [created] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)

if (created) {
  await db.update(user).set({ builtIn: true, updatedAt: new Date() }).where(eq(user.id, created.id))
  await db
    .insert(userRole)
    .values({ userId: created.id, roleId: adminRoleId })
    .onConflictDoNothing()
  await db
    .insert(notification)
    .values({
      id: crypto.randomUUID(),
      userId: created.id,
      type: "notice",
      title: "系统初始化完成",
      description: "默认管理员、系统菜单和基础设置已经创建。",
    })
    .onConflictDoNothing()
}

console.log(`Admin user created: ${email}`)
await pool.end()
