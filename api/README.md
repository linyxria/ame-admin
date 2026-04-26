# AME Admin API

基于 Elysia、Better Auth、PostgreSQL 和 Drizzle 的后台 API。

Docker Compose 使用 `ame-admin` 作为项目名，数据库容器名为 `db`，持久化数据卷名为 `ame-admin_db`。

## 数据库

本地开发建议使用 Docker Compose。这样 PostgreSQL 不会污染系统环境，也更容易在不同机器上复现。

启动 PostgreSQL：

```bash
bun run db:up
```

创建本地环境变量文件：

```bash
cp .env.example .env
```

默认 `.env.example` 已经匹配 Docker 数据库：

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ame_admin
```

执行迁移并创建默认管理员：

```bash
bun run db:setup
```

也可以分开执行：

```bash
bun run db:migrate
bun run db:seed
```

默认本地管理员账号：

```bash
admin@example.com
admin123456
```

可选数据库工具：

```bash
bun run db:studio
bun run db:logs
```

停止 PostgreSQL：

```bash
bun run db:down
```

PostgreSQL 18 的官方 Docker 镜像使用按大版本区分的数据目录。本项目把数据卷挂载到 `/var/lib/postgresql`，这是官方镜像对 18+ 推荐的布局。

## 开发

启动 API：

```bash
bun run dev
```

健康检查：

```bash
curl http://localhost:3000/health
```

未登录访问受保护路由：

```bash
curl -i http://localhost:3000/me
```

在没有有效 Better Auth session cookie 时，应返回 `401 Unauthorized`。

## 认证接口

Better Auth 已挂载到 Elysia。当前开启邮箱密码登录，常用接口包括：

- `POST /sign-in/email`
- `POST /sign-out`
- `GET /get-session`

公开注册已默认禁用。默认管理员请通过 `bun run db:seed` 创建。
