import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { Card, Col, Empty, Row, Space, Statistic, Tag } from "antd"
import { systemApi, systemQueryKeys } from "../lib/system-api"

export const Route = createFileRoute("/_admin/dashboard")({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { session, user } = useRouteContext({ from: "/_admin/dashboard" })
  const overviewQuery = useQuery({
    queryKey: systemQueryKeys.overview,
    queryFn: systemApi.overview,
  })
  const overview = overviewQuery.data

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-4xl font-semibold">Dashboard</h1>
        <p className="ame-page-description text-base">管理后台基础骨架已经就绪。</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="用户数量" value={overview?.users ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="角色数量" value={overview?.roles ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="菜单数量" value={overview?.menus ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="未读通知" value={overview?.unreadNotifications ?? 0} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="最近操作">
            {overview?.latestAuditLogs.length ? (
              <div className="divide-y">
                {overview.latestAuditLogs.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <Space>
                      <Tag>{item.action}</Tag>
                      <span>{item.summary}</span>
                    </Space>
                    <div className="ame-text-subtle mt-1 text-sm">
                      {item.actorName ?? item.actorEmail ?? "系统"} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无审计记录" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={`当前用户 · ${session ? "已登录" : "加载中"}`}>
            <div className="space-y-2">
              <div>
                <span className="ame-text-subtle">姓名：</span>
                {user.name}
              </div>
              <div>
                <span className="ame-text-subtle">邮箱：</span>
                {user.email}
              </div>
              <div>
                <span className="ame-text-subtle">用户 ID：</span>
                <span className="break-all">{user.id}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
