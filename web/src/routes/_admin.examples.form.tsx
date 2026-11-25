import { Button, Group, Select, Stack, Switch, Text, TextInput } from "@mantine/core"
import { DatesProvider, DateTimePicker } from "@mantine/dates"
import { Dropzone } from "@mantine/dropzone"
import { createFileRoute } from "@tanstack/react-router"
import { Upload } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader, SectionPanel } from "../components/design-system"
import "@mantine/dates/styles.layer.css"
import "@mantine/dropzone/styles.layer.css"
import "dayjs/locale/zh-cn"

export const Route = createFileRoute("/_admin/examples/form")({
  component: FormDemoRoute,
})

function FormDemoRoute() {
  const { t, i18n } = useTranslation()
  const [files, setFiles] = useState<File[]>([])

  return (
    <Stack gap="lg">
      <PageHeader title={t("formDemo")} description={t("formDescription")} />
      <SectionPanel title={t("formDemo")}>
        <form className="max-w-3xl" onSubmit={(event) => event.preventDefault()}>
          <Stack>
            <TextInput label={t("title")} name="title" required />
            <Select
              label={t("type")}
              data={[
                { label: t("notice"), value: "notice" },
                { label: t("campaign"), value: "campaign" },
                { label: t("document"), value: "doc" },
              ]}
            />
            <DatesProvider settings={{ locale: i18n.language === "zh-CN" ? "zh-cn" : "en" }}>
              <DateTimePicker
                type="range"
                label={t("publishTime")}
                clearable
                clearButtonProps={{ "aria-label": t("clear") }}
              />
            </DatesProvider>
            <div>
              <Text id="rich-text-label" size="sm" fw={500} mb={4}>
                {t("richTextContent")}
              </Text>
              {/* biome-ignore lint/a11y/useSemanticElements: Native text fields cannot edit rich text. */}
              <div
                tabIndex={0}
                contentEditable
                role="textbox"
                aria-multiline="true"
                aria-labelledby="rich-text-label"
                className="ame-border ame-surface ame-text min-h-44 rounded-md border p-3 focus-visible:outline-2 focus-visible:outline-(--ame-accent)"
                suppressContentEditableWarning
              >
                <h3>{t("welcomeTitle")}</h3>
                <p>{t("richTextHint")}</p>
              </div>
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-medium">{t("attachment")}</legend>
              <Dropzone
                onDrop={(accepted) => setFiles((previous) => [...previous, ...accepted])}
                aria-label={t("attachment")}
              >
                <Group justify="center" className="pointer-events-none py-4">
                  <Upload size={20} />
                  <Text c="dimmed" size="sm">
                    {t("uploadHint")}
                  </Text>
                </Group>
              </Dropzone>
              {files.length > 0 && (
                <Group justify="space-between" mt="xs">
                  <Text size="sm" className="break-all">
                    {files.map((file) => file.name).join(", ")}
                  </Text>
                  <Button variant="subtle" onClick={() => setFiles([])}>
                    {t("clear")}
                  </Button>
                </Group>
              )}
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">{t("publishSettings")}</legend>
              <Group>
                <Switch label={t("pinned")} />
                <Switch label={t("comments")} />
                <Switch label={t("notifications")} />
              </Group>
            </fieldset>
            <Group>
              <Button type="submit">{t("submit")}</Button>
              <Button variant="default">{t("saveDraft")}</Button>
            </Group>
          </Stack>
        </form>
      </SectionPanel>
    </Stack>
  )
}
