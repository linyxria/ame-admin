import { createFileRoute } from "@tanstack/react-router"
import { Button, Card, DatePicker, Form, Input, Select, Space, Switch, Upload } from "antd"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_admin/demos/form")({
  component: FormDemoRoute,
})

function FormDemoRoute() {
  const { t } = useTranslation()

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("formDemo")}</h1>
        <p className="ame-page-description text-sm">{t("formDescription")}</p>
      </div>
      <Card>
        <Form layout="vertical" className="max-w-3xl">
          <Form.Item label={t("title")} name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t("type")} name="type">
            <Select
              options={[
                { label: t("notice"), value: "notice" },
                { label: t("campaign"), value: "campaign" },
                { label: t("document"), value: "doc" },
              ]}
            />
          </Form.Item>
          <Form.Item label={t("publishTime")} name="range">
            <DatePicker.RangePicker className="w-full" showTime />
          </Form.Item>
          <Form.Item label={t("richTextContent")}>
            <div
              contentEditable
              className="ame-border ame-surface ame-text min-h-44 rounded-md border p-3 outline-none focus:border-blue-500"
              suppressContentEditableWarning
            >
              <h3>{t("welcomeTitle")}</h3>
              <p>{t("richTextHint")}</p>
            </div>
          </Form.Item>
          <Form.Item label={t("attachment")}>
            <Upload.Dragger beforeUpload={() => false}>
              <p className="ame-text-subtle py-6">{t("uploadHint")}</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label={t("publishSettings")}>
            <Space>
              <Switch checkedChildren={t("pinned")} unCheckedChildren={t("pinned")} />
              <Switch checkedChildren={t("comments")} unCheckedChildren={t("comments")} />
              <Switch checkedChildren={t("notifications")} unCheckedChildren={t("notifications")} />
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">{t("submit")}</Button>
              <Button>{t("saveDraft")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  )
}
