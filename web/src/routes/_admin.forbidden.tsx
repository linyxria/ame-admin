import { createFileRoute, Link } from "@tanstack/react-router"
import { Button, Result } from "antd"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_admin/forbidden")({
  component: ForbiddenRoute,
})

function ForbiddenRoute() {
  const { t } = useTranslation()

  return (
    <Result
      status="403"
      title={t("forbidden")}
      subTitle={t("forbiddenDescription")}
      extra={
        <Button type="primary">
          <Link to="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      }
    />
  )
}
