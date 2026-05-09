import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { App, Button, Card, Form, Input, Select, Space, Switch } from "antd"
import { useTranslation } from "react-i18next"
import { type SettingsInput, updateSettingsMutationOptions } from "../services/system/mutations"
import {
  currentUserPermissionsQueryOptions,
  type SystemSetting,
  settingsQueryKey,
  settingsQueryOptions,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/settings")({
  component: SystemSettingsRoute,
})

type SettingsForm = {
  siteName: string
  defaultLanguage: string
  passwordMinLength: number
  allowPublicSignUp: boolean
}

function getSetting(items: SystemSetting[] | null, key: string) {
  return items?.find((item) => item.key === key)?.value
}

function SystemSettingsRoute() {
  const [form] = Form.useForm<SettingsForm>()
  const { message } = App.useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const settingsQuery = useQuery(settingsQueryOptions())
  const permissionsQuery = useQuery(currentUserPermissionsQueryOptions())
  const canUpdate =
    permissionsQuery.data
      ?.find((item) => item.path === "/system/settings")
      ?.actions.includes("update") ?? false
  const updateSettings = useMutation({
    ...updateSettingsMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsQueryKey })
      message.success(t("saveSuccess"))
    },
  })
  const settings = settingsQuery.data ?? []
  const initialValues = {
    siteName: getSetting(settings, "siteName") ?? t("appName"),
    defaultLanguage: getSetting(settings, "defaultLanguage") ?? "en-US",
    passwordMinLength: Number(getSetting(settings, "passwordMinLength") ?? 8),
    allowPublicSignUp: getSetting(settings, "allowPublicSignUp") === "true",
  }

  const submit = async () => {
    const values = await form.validateFields()
    const body: SettingsInput = {
      items: [
        { key: "siteName", value: values.siteName, description: t("siteName") },
        {
          key: "defaultLanguage",
          value: values.defaultLanguage,
          description: t("defaultLanguage"),
        },
        {
          key: "passwordMinLength",
          value: String(values.passwordMinLength),
          description: t("passwordMinLengthSetting"),
        },
        {
          key: "allowPublicSignUp",
          value: String(values.allowPublicSignUp),
          description: t("allowPublicSignUp"),
        },
      ],
    }
    await updateSettings.mutateAsync(body)
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("systemSettings")}</h1>
        <p className="ame-page-description text-sm">{t("settingsDescription")}</p>
      </div>

      <Card loading={settingsQuery.isLoading}>
        <Form
          form={form}
          layout="vertical"
          className="max-w-2xl"
          initialValues={initialValues}
          key={settings.map((item) => `${item.key}:${item.value}`).join("|")}
        >
          <Form.Item name="siteName" label={t("siteName")} rules={[{ required: true }]}>
            <Input disabled={!canUpdate} />
          </Form.Item>
          <Form.Item
            name="defaultLanguage"
            label={t("defaultLanguage")}
            rules={[{ required: true }]}
          >
            <Select
              disabled={!canUpdate}
              options={[
                { label: t("simplifiedChinese"), value: "zh-CN" },
                { label: t("english"), value: "en-US" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="passwordMinLength"
            label={t("passwordMinLengthSetting")}
            rules={[{ required: true }]}
          >
            <Input type="number" min={8} disabled={!canUpdate} />
          </Form.Item>
          <Form.Item
            name="allowPublicSignUp"
            label={t("allowPublicSignUp")}
            valuePropName="checked"
          >
            <Switch
              disabled={!canUpdate}
              checkedChildren={t("allowed")}
              unCheckedChildren={t("blocked")}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              disabled={!canUpdate}
              loading={updateSettings.isPending}
              onClick={submit}
            >
              {t("save")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  )
}
