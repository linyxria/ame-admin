import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ErrorState } from "../components/error-state"

export const Route = createFileRoute("/_admin/forbidden")({
  component: ForbiddenRoute,
})

function ForbiddenRoute() {
  const { t } = useTranslation()

  return (
    <ErrorState
      status="403"
      title={t("forbidden")}
      description={t("forbiddenDescription")}
      primaryText={t("backToWorkbench")}
      primaryTo="/dashboard/workbench"
      secondaryText={t("goBack")}
    />
  )
}
