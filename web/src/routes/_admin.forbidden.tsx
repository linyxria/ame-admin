import { createFileRoute, Link } from "@tanstack/react-router"
import { Button, Result } from "antd"

export const Route = createFileRoute("/_admin/forbidden")({
  component: ForbiddenRoute,
})

function ForbiddenRoute() {
  return (
    <Result
      status="403"
      title="无权限访问"
      subTitle="当前账号没有访问这个页面的权限。"
      extra={
        <Button type="primary">
          <Link to="/dashboard">返回控制台</Link>
        </Button>
      }
    />
  )
}
