import { ActionIcon, type ActionIconProps, Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

export function IconAction({
  label,
  children,
  confirmation,
  onClick,
  ...props
}: ActionIconProps & {
  label: string
  confirmation?: string
  children: ReactNode
  onClick: () => void
}) {
  const { t } = useTranslation()

  return (
    <Tooltip label={label}>
      <span className="inline-flex">
        <ActionIcon
          variant="subtle"
          aria-label={label}
          {...props}
          onClick={() => {
            if (!confirmation) {
              onClick()
              return
            }

            modals.openConfirmModal({
              title: confirmation,
              labels: { confirm: label, cancel: t("cancel") },
              confirmProps: { color: props.color },
              cancelProps: { "data-autofocus": true },
              onConfirm: onClick,
            })
          }}
        >
          {children}
        </ActionIcon>
      </span>
    </Tooltip>
  )
}
