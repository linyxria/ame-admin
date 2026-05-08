import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { App, Avatar, Button, Card, Form, Input, Space, Typography } from "antd"
import { User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { type ProfileInput, updateProfileMutationOptions } from "../services/system/mutations"

export const Route = createFileRoute("/_admin/account/settings")({
  component: AccountSettingsRoute,
})

function AccountSettingsRoute() {
  const [form] = Form.useForm<ProfileInput>()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const { user } = useRouteContext({ from: "/_admin/account/settings" })
  const { t } = useTranslation()
  const updateProfile = useMutation({
    ...updateProfileMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      message.success(t("save"))
    },
  })

  const submit = async () => {
    await updateProfile.mutateAsync(await form.validateFields())
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("userSettings")}</h1>
        <p className="ame-page-description text-sm">{user.email}</p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          className="max-w-2xl"
          initialValues={{ name: user.name, image: user.image }}
        >
          <Form.Item shouldUpdate noStyle>
            {() => (
              <div className="mb-4 flex items-center gap-4">
                <Avatar size={64} src={form.getFieldValue("image")} icon={<User size={24} />} />
                <Typography.Text type="secondary">{t("avatarHint")}</Typography.Text>
              </div>
            )}
          </Form.Item>
          <Form.Item name="name" label={t("name")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image" label={t("avatar")}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={updateProfile.isPending} onClick={submit}>
              {t("save")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  )
}
