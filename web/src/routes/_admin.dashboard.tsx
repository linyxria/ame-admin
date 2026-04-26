import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { Card, Col, Row, Space, Statistic } from 'antd'

export const Route = createFileRoute('/_admin/dashboard')({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { session, user } = useRouteContext({ from: '/_admin/dashboard' })

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="mb-1.5 text-4xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-base text-slate-700">管理后台基础骨架已经就绪。</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="会话状态" value={session ? '已登录' : '加载中'} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="认证方式" value="邮箱密码" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="接口状态" value={session ? '检查失败' : '已连接'} />
          </Card>
        </Col>
      </Row>

      <Card title="当前用户">
        <pre className="m-0 min-h-40 overflow-auto rounded-md bg-slate-900 p-4 text-[13px] leading-relaxed text-emerald-100">
          {JSON.stringify(user, null, 2)}
        </pre>
      </Card>
    </Space>
  )
}
