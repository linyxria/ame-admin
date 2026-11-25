import { Button, Group } from "@mantine/core"
import { useTranslation } from "react-i18next"

export function FormActions({ onCancel, loading }: { onCancel: () => void; loading: boolean }) {
  const { t } = useTranslation()

  return (
    <Group justify="flex-end" mt="xs">
      <Button variant="default" onClick={onCancel} disabled={loading}>
        {t("cancel")}
      </Button>
      <Button type="submit" loading={loading}>
        {t("save")}
      </Button>
    </Group>
  )
}
