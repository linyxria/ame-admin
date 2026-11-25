import { Code } from "@mantine/core"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ErrorState } from "./error-state"

export function NotFoundPage() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="ame-page-bg min-h-screen">
      <ErrorState
        status="404"
        title={t("pageNotFound")}
        description={
          <span>
            {t("pageNotFoundDescription")} <Code>{location.pathname}</Code>
          </span>
        }
        primaryText={t("backToWorkbench")}
        primaryTo="/dashboard/workbench"
        secondaryText={t("goBack")}
      />
    </div>
  )
}
