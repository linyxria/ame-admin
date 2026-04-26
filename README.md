# AME Admin

这是一个包含 `api` 和 `web` 的管理后台项目。

## 工作区

项目使用 Bun workspace 管理两个子项目：

```text
api  - Elysia 后端
web  - React 前端
```

依赖锁文件统一使用根目录的 `bun.lock`，子项目下不再维护单独的 lockfile。

根目录可以直接代理常用命令：

```bash
bun run dev:api
bun run dev:web
bun run build:web
bun run typecheck:api
```

数据库命令也可以在根目录执行：

```bash
bun run db:up
bun run db:setup
bun run db:down
```

如果要直接运行某个 workspace 的脚本，也可以使用 Bun filter：

```bash
bun --filter ame-admin-api dev
bun --filter ame-admin-web build
```

## 代码检查与格式化

项目使用 Biome 统一管理 `api` 和 `web` 的 lint 与 format，不再使用 ESLint。

在仓库根目录执行：

```bash
bun run check
bun run lint
bun run format
```

自动格式化并应用安全修复：

```bash
bun run check:write
```

也可以在子项目目录执行同样的代理脚本：

```bash
cd api
bun run check

cd ../web
bun run check
```

Biome 配置位于 `biome.json`。当前主要检查源码、Vite 配置、Drizzle 配置和 package.json；`tsconfig*.json` 暂不交给 Biome 格式化，避免破坏 TypeScript 模板里的注释排版。
