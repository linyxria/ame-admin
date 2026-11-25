import { Avatar, Button, Group, Stack, Text, TextInput } from "@mantine/core"
import { isNotEmpty, useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { PageHeader, SectionPanel } from "../components/design-system"
import { showRequestError } from "../lib/request-notification"
import { updateProfileMutationOptions } from "../services/system/mutations"

export const Route = createFileRoute("/_admin/account/settings")({
  component: AccountSettingsRoute,
})

function AccountSettingsRoute() {
  const queryClient = useQueryClient()
  const { user } = useRouteContext({ from: "/_admin/account/settings" })
  const { t } = useTranslation()
  const form = useForm({
    initialValues: { name: user.name, image: user.image ?? "" },
    validate: { name: isNotEmpty(t("enterName")) },
  })
  const updateProfile = useMutation({
    ...updateProfileMutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      notifications.show({ color: "green", message: t("saveSuccess") })
    },
    onError: (error) => showRequestError(error, t("saveFailed")),
  })

  return (
    <Stack gap="lg">
      <PageHeader title={t("userSettings")} description={user.email} />

      <SectionPanel title={t("editProfile")}>
        <form
          className="max-w-2xl"
          onSubmit={form.onSubmit(({ name, image }) =>
            updateProfile.mutate({ name, image: image || null }),
          )}
        >
          <Stack>
            <Group>
              <Avatar size={64} src={form.values.image || null} alt="">
                <User size={24} />
              </Avatar>
              <Text c="dimmed" size="sm">
                {t("avatarHint")}
              </Text>
            </Group>
            <TextInput
              label={t("name")}
              name="name"
              autoComplete="name"
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t("avatar")}
              name="image"
              placeholder="https://…"
              {...form.getInputProps("image")}
            />
            <Group>
              <Button type="submit" loading={updateProfile.isPending}>
                {t("save")}
              </Button>
            </Group>
          </Stack>
        </form>
      </SectionPanel>
    </Stack>
  )
}
