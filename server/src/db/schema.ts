import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  enabled: boolean("enabled").notNull().default(true),
  builtIn: boolean("builtIn").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
)

export const role = pgTable(
  "role",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    enabled: boolean("enabled").notNull().default(true),
    builtIn: boolean("builtIn").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("role_code_idx").on(table.code)],
)

export const menu = pgTable(
  "menu",
  {
    id: text("id").primaryKey(),
    parentId: text("parentId"),
    title: text("title").notNull(),
    titleKey: text("titleKey"),
    path: text("path").notNull(),
    icon: text("icon"),
    sort: integer("sort").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    builtIn: boolean("builtIn").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => [
    index("menu_parentId_idx").on(table.parentId),
    uniqueIndex("menu_path_idx").on(table.path),
  ],
)

export const userRole = pgTable(
  "user_role",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("roleId")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index("user_role_userId_idx").on(table.userId),
    index("user_role_roleId_idx").on(table.roleId),
  ],
)

export const roleMenu = pgTable(
  "role_menu",
  {
    roleId: text("roleId")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    menuId: text("menuId")
      .notNull()
      .references(() => menu.id, { onDelete: "cascade" }),
    actions: text("actions").notNull().default("view"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.menuId] }),
    index("role_menu_roleId_idx").on(table.roleId),
    index("role_menu_menuId_idx").on(table.menuId),
  ],
)

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actorId").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actorName"),
    actorEmail: text("actorEmail"),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resourceId"),
    summary: text("summary").notNull(),
    detail: text("detail"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_actorId_idx").on(table.actorId),
    index("audit_log_resource_idx").on(table.resource),
    index("audit_log_createdAt_idx").on(table.createdAt),
  ],
)

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("notice"),
    title: text("title").notNull(),
    description: text("description"),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [
    index("notification_userId_idx").on(table.userId),
    index("notification_createdAt_idx").on(table.createdAt),
  ],
)

export const systemSetting = pgTable("system_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const schema = {
  user,
  session,
  account,
  verification,
  role,
  menu,
  userRole,
  roleMenu,
  auditLog,
  notification,
  systemSetting,
}
