import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { Card, Col, Row, Space, Statistic } from 'antd'
import { systemApi, systemQueryKeys } from '../lib/system-api'

export const Route = createFileRoute('/_admin/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { session, user } = useRouteContext({ from: '/_admin/dashboard' })
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
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="用户数量" value={overview?.users ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="角色数量" value={overview?.roles ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="菜单数量" value={overview?.menus ?? 0} />
          </Card>
        </Col>
      </Row>

      <Card title={`当前用户 · ${session ? '已登录' : '加载中'}`}>
        <pre className="m-0 min-h-40 overflow-auto rounded-md bg-slate-900 p-4 text-[13px] leading-relaxed text-emerald-100">
          {JSON.stringify(user, null, 2)}
        </pre>
      </Card>
    </Space>
  )
}
