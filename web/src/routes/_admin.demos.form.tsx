import { createFileRoute } from "@tanstack/react-router"
import { Button, Card, DatePicker, Form, Input, Select, Space, Switch, Upload } from "antd"

export const Route = createFileRoute("/_admin/demos/form")({
  component: FormDemoRoute,
})

function FormDemoRoute() {
  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">表单示例</h1>
        <p className="ame-page-description text-sm">复杂表单、富文本、附件、时间范围和动态配置。</p>
      </div>
      <Card>
        <Form layout="vertical" className="max-w-3xl">
          <Form.Item label="标题" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="类型" name="type">
            <Select
              options={[
                { label: "公告", value: "notice" },
                { label: "活动", value: "campaign" },
                { label: "文档", value: "doc" },
              ]}
            />
          </Form.Item>
          <Form.Item label="发布时间" name="range">
            <DatePicker.RangePicker className="w-full" showTime />
          </Form.Item>
          <Form.Item label="富文本内容">
            <div
              contentEditable
              className="ame-border ame-surface ame-text min-h-44 rounded-md border p-3 outline-none focus:border-blue-500"
              suppressContentEditableWarning
            >
              <h3>欢迎使用 AME Admin</h3>
              <p>这里可以接入 TipTap、Lexical、Plate 等编辑器作为通用富文本能力。</p>
            </div>
          </Form.Item>
          <Form.Item label="附件">
            <Upload.Dragger beforeUpload={() => false}>
              <p className="ame-text-subtle py-6">拖拽文件到这里，或点击选择文件</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="发布设置">
            <Space>
              <Switch checkedChildren="置顶" unCheckedChildren="置顶" />
              <Switch checkedChildren="评论" unCheckedChildren="评论" />
              <Switch checkedChildren="通知" unCheckedChildren="通知" />
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">提交</Button>
              <Button>保存草稿</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  )
}
