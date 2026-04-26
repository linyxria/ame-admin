# AME Admin Web

基于 React、Vite、TanStack Router、TanStack Query、Ant Design 和 Tailwind CSS 的后台前端。

## 开发

安装依赖后启动前端：

```bash
bun run dev
```

默认会访问本地 API：

```bash
http://localhost:3000
```

如需修改 API 地址，可以创建 `.env.local`：

```bash
VITE_API_URL=http://localhost:3000
```

## 登录

先启动并初始化后端数据库：

```bash
cd ../api
bun run db:up
bun run db:setup
bun run dev
```

然后启动前端：

```bash
cd ../web
bun run dev
```

默认本地管理员账号：

```bash
admin@example.com
admin123456
```

## 路由与接口

路由使用 TanStack Router：

- `/login`：管理员登录
- `/dashboard`：受保护的控制台

业务 API 使用 Elysia Eden Treaty，并从后端导入 `App` 类型获得端到端类型安全。

认证请求使用 Better Auth React client。跨域 cookie 场景已设置 `credentials: 'include'`。

## 样式

页面布局和自定义样式使用 Tailwind CSS 工具类。

没有引入 `antd/dist/reset.css`。Ant Design 的组件样式由组件库运行时注入；如果后续需要额外的全局 reset，再按 Ant Design 文档处理 `@layer` 顺序。

## 构建

```bash
bun run build
```
