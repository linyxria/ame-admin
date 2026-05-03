import { createFileRoute } from "@tanstack/react-router"
import { Card, Col, Progress, Row, Space, Statistic, Table, Tag } from "antd"

export const Route = createFileRoute("/_admin/demos/charts")({
  component: ChartsDemoRoute,
})

const bars = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 68 },
  { label: "Wed", value: 55 },
  { label: "Thu", value: 82 },
  { label: "Fri", value: 73 },
  { label: "Sat", value: 34 },
  { label: "Sun", value: 49 },
]

function ChartsDemoRoute() {
  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">图表示例</h1>
        <p className="ame-page-description text-sm">展示卡片指标、柱状趋势、进度和排行。</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="活跃用户" value={12846} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="转化率" value={38.6} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="工单完成" value={92} suffix="%" />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="访问趋势">
            <div className="flex h-72 items-end gap-4 px-2">
              {bars.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-blue-500"
                    style={{ height: `${item.value * 2.4}px` }}
                  />
                  <span className="ame-text-subtle text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="目标进度">
            <Space orientation="vertical" className="w-full">
              <Progress percent={72} />
              <Progress percent={54} status="active" />
              <Progress percent={93} strokeColor="#16a34a" />
            </Space>
          </Card>
        </Col>
      </Row>
      <Card title="渠道排行">
        <Table
          rowKey="channel"
          pagination={false}
          dataSource={[
            { channel: "Organic", visits: 4821, status: "稳定" },
            { channel: "Referral", visits: 3188, status: "增长" },
            { channel: "Campaign", visits: 2419, status: "观察" },
          ]}
          columns={[
            { title: "渠道", dataIndex: "channel" },
            { title: "访问量", dataIndex: "visits" },
            { title: "状态", dataIndex: "status", render: (value) => <Tag>{value}</Tag> },
          ]}
        />
      </Card>
    </Space>
  )
}
