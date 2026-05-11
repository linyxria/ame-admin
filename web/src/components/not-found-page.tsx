import { useLocation } from "@tanstack/react-router"
import { Typography } from "antd"
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
            {t("pageNotFoundDescription")}{" "}
            <Typography.Text code>{location.pathname}</Typography.Text>
          </span>
        }
        primaryText={t("backToWorkbench")}
        primaryTo="/dashboard/workbench"
        secondaryText={t("goBack")}
      />
    </div>
  )
}
