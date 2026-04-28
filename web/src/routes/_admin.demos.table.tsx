import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, Input, Space, Table, Tag } from 'antd'

export const Route = createFileRoute('/_admin/demos/table')({
  component: TableDemoRoute,
})

function TableDemoRoute() {
  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">表格示例</h1>
        <p className="ame-page-description text-sm">常见筛选、批量操作、状态标签和固定操作区。</p>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Space>
            <Input.Search placeholder="搜索项目" className="w-64" />
            <Button>重置</Button>
          </Space>
          <Space>
            <Button>批量归档</Button>
            <Button type="primary">新建项目</Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          rowSelection={{}}
          dataSource={[
            { id: 1, name: '权限中心重构', owner: 'Lucy', status: 'running', progress: '72%' },
            { id: 2, name: '通知中心设计', owner: 'Ning', status: 'review', progress: '48%' },
            { id: 3, name: '组件库升级', owner: 'Zheng', status: 'done', progress: '100%' },
          ]}
          columns={[
            { title: '项目', dataIndex: 'name' },
            { title: '负责人', dataIndex: 'owner' },
            {
              title: '状态',
              dataIndex: 'status',
              filters: [
                { text: '运行中', value: 'running' },
                { text: '评审中', value: 'review' },
                { text: '已完成', value: 'done' },
              ],
              render: (value) => <Tag color={value === 'done' ? 'green' : 'blue'}>{value}</Tag>,
            },
            { title: '进度', dataIndex: 'progress' },
            { title: '操作', fixed: 'right', render: () => <Button type="link">详情</Button> },
          ]}
        />
      </Card>
    </Space>
  )
}
