import {
  Alert,
  Button,
  Group,
  Loader,
  NativeSelect,
  NumberInput,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core"
import { isNotEmpty, useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useEffectEvent } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader, SectionPanel } from "../components/design-system"
import { showRequestError } from "../lib/request-notification"
import { updateSettingsMutationOptions } from "../services/system/mutations"
import {
  currentUserPermissionsQueryOptions,
  type SystemSetting,
  settingsQueryKey,
  settingsQueryOptions,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/settings")({
  component: SystemSettingsRoute,
})

function SystemSettingsRoute() {
  const { t } = useTranslation()
  const settings = useQuery(settingsQueryOptions())
  const permissions = useQuery(currentUserPermissionsQueryOptions())
  const canUpdate =
    permissions.data
      ?.find((item) => item.path === "/system/settings")
      ?.actions.includes("update") ?? false

  return (
    <Stack gap="lg">
      <PageHeader title={t("systemSettings")} description={t("settingsDescription")} />
      <SectionPanel title={t("systemSettings")}>
        {settings.isError && (
          <Alert color="red" role="alert">
            {t("requestFailed")}
          </Alert>
        )}
        {settings.isPending && <Loader size="sm" aria-label={t("loading")} />}
        {settings.data && (
          <SettingsForm
            settings={settings.data}
            canUpdate={canUpdate}
            isRefetchError={settings.isRefetchError}
          />
        )}
      </SectionPanel>
    </Stack>
  )
}

type SettingsValues = {
  siteName: string
  defaultLanguage: string
  passwordMinLength: number | string
  allowPublicSignUp: boolean
}

const settingLabels = {
  siteName: "siteName",
  defaultLanguage: "defaultLanguage",
  passwordMinLength: "passwordMinLengthSetting",
  allowPublicSignUp: "allowPublicSignUp",
} as const satisfies Record<keyof SettingsValues, string>

const settingKeys = Object.keys(settingLabels) as (keyof SettingsValues)[]
const settingDefaults = {
  defaultLanguage: "en-US",
  passwordMinLength: 8,
  allowPublicSignUp: false,
}

function readSettings(
  settings: Pick<SystemSetting, "key" | "value">[],
  fallback: SettingsValues,
): SettingsValues {
  const values = new Map(settings.map(({ key, value }) => [key, value]))
  const passwordMinLength = values.get("passwordMinLength")
  const allowPublicSignUp = values.get("allowPublicSignUp")
  return {
    siteName: values.get("siteName") ?? fallback.siteName,
    defaultLanguage: values.get("defaultLanguage") ?? fallback.defaultLanguage,
    passwordMinLength:
      passwordMinLength === undefined ? fallback.passwordMinLength : Number(passwordMinLength),
    allowPublicSignUp:
      allowPublicSignUp === undefined ? fallback.allowPublicSignUp : allowPublicSignUp === "true",
  }
}

function SettingsForm({
  settings,
  canUpdate,
  isRefetchError,
}: {
  settings: SystemSetting[]
  canUpdate: boolean
  isRefetchError: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const defaultSiteName = t("appName")
  const form = useForm({
    initialValues: readSettings(settings, { ...settingDefaults, siteName: defaultSiteName }),
    validate: {
      siteName: isNotEmpty(t("requiredField")),
      passwordMinLength: (value) =>
        Number.isInteger(Number(value)) && Number(value) >= 8 ? null : t("minNumber", { min: 8 }),
    },
  })
  const updateSettings = useMutation({
    ...updateSettingsMutationOptions(),
    onSuccess: async (_result, { items }) => {
      form.resetDirty(readSettings(items, form.getInitialValues()))
      await queryClient.invalidateQueries({ queryKey: settingsQueryKey })
      notifications.show({ color: "green", message: t("saveSuccess") })
    },
    onError: (error) => showRequestError(error, t("saveFailed")),
  })

  const syncSavedSettings = useEffectEvent((fields: SettingsValues) => {
    for (const key of settingKeys) {
      if (!form.isDirty(key) && form.getValues()[key] !== fields[key]) {
        form.setFieldValue(key, fields[key])
      }
    }
    form.resetDirty(fields)
  })
  useEffect(() => {
    if (!updateSettings.isPending && !isRefetchError) {
      syncSavedSettings(readSettings(settings, { ...settingDefaults, siteName: defaultSiteName }))
    }
  }, [settings, defaultSiteName, updateSettings.isPending, isRefetchError])

  return (
    <form
      className="max-w-2xl"
      onSubmit={form.onSubmit((fields) => {
        if (!canUpdate || updateSettings.isPending) return

        const items = settingKeys
          .filter((key) => form.isDirty(key))
          .map((key) => ({ key, value: String(fields[key]), description: t(settingLabels[key]) }))
        if (items.length) updateSettings.mutate({ items })
      })}
    >
      <Stack>
        <TextInput
          label={t("siteName")}
          disabled={!canUpdate}
          withAsterisk
          {...form.getInputProps("siteName")}
        />
        <NativeSelect
          label={t("defaultLanguage")}
          disabled={!canUpdate}
          data={[
            { label: t("simplifiedChinese"), value: "zh-CN" },
            { label: t("english"), value: "en-US" },
          ]}
          {...form.getInputProps("defaultLanguage")}
        />
        <NumberInput
          label={t("passwordMinLengthSetting")}
          min={8}
          allowDecimal={false}
          disabled={!canUpdate}
          withAsterisk
          {...form.getInputProps("passwordMinLength")}
        />
        <Switch
          label={t("allowPublicSignUp")}
          disabled={!canUpdate}
          onLabel={t("allowed")}
          offLabel={t("blocked")}
          {...form.getInputProps("allowPublicSignUp", { type: "checkbox" })}
        />
        <Group>
          <Button
            type="submit"
            disabled={!canUpdate || !form.isDirty()}
            loading={updateSettings.isPending}
          >
            {t("save")}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
