import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { Card, Col, Empty, Row, Space, Statistic, Tag } from "antd"
import { useTranslation } from "react-i18next"
import { overviewQueryOptions } from "../services/system/queries"

export const Route = createFileRoute("/_admin/dashboard")({
  component: DashboardRoute,
})

function DashboardRoute() {
  const { session, user } = useRouteContext({ from: "/_admin/dashboard" })
  const { t } = useTranslation()
  const overviewQuery = useQuery(overviewQueryOptions())
  const overview = overviewQuery.data

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-4xl font-semibold">Dashboard</h1>
        <p className="ame-page-description text-base">{t("dashboardReady")}</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("userCount")} value={overview?.users ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("roleCount")} value={overview?.roles ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title={t("menuCount")} value={overview?.menus ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title={t("unreadNotifications")}
              value={overview?.unreadNotifications ?? 0}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={t("recentOperations")}>
            {overview?.latestAuditLogs.length ? (
              <div className="divide-y">
                {overview.latestAuditLogs.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <Space>
                      <Tag>{item.action}</Tag>
                      <span>{item.summary}</span>
                    </Space>
                    <div className="ame-text-subtle mt-1 text-sm">
                      {item.actorName ?? item.actorEmail ?? t("system")} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("noAuditLogs")} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={`${t("currentUser")} · ${session ? t("signedIn") : t("loading")}`}>
            <div className="space-y-2">
              <div>
                <span className="ame-text-subtle">{t("name")}:</span>
                {user.name}
              </div>
              <div>
                <span className="ame-text-subtle">{t("email")}:</span>
                {user.email}
              </div>
              <div>
                <span className="ame-text-subtle">{t("userId")}:</span>
                <span className="break-all">{user.id}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
