import { createFileRoute } from "@tanstack/react-router"
import { Progress, Space, Tag } from "antd"
import { useTranslation } from "react-i18next"
import { MetricCard, MetricStrip, PageHeader, SectionPanel } from "../components/design-system"

export const Route = createFileRoute("/_admin/dashboard/analytics")({
  component: AnalyticsRoute,
})

const funnel = [
  { label: "Visit", value: 12840, percent: 100 },
  { label: "Trial", value: 4820, percent: 38 },
  { label: "Active", value: 2960, percent: 23 },
  { label: "Paid", value: 1184, percent: 9 },
]

function AnalyticsRoute() {
  const { t } = useTranslation()

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <PageHeader
        eyebrow="Insights"
        title={t("analytics")}
        description={t("analyticsDescription")}
      />
      <MetricStrip>
        <MetricCard label={t("activeUsers")} value="12,846" delta="+4.2% vs 24h ago" tone="blue" />
        <MetricCard
          label={t("conversionRate")}
          value="38.6%"
          delta="+1.8% vs 24h ago"
          tone="green"
        />
        <MetricCard
          label={t("ticketCompletion")}
          value="92%"
          delta="-0.3% vs 24h ago"
          tone="orange"
        />
      </MetricStrip>
      <SectionPanel title={t("conversionFunnel")}>
        <div className="grid gap-4">
          {funnel.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Space>
                  <Tag>{item.label}</Tag>
                  <span className="ame-text font-medium">{item.value.toLocaleString()}</span>
                </Space>
                <span className="ame-text-subtle text-sm">{item.percent}%</span>
              </div>
              <Progress percent={item.percent} showInfo={false} />
            </div>
          ))}
        </div>
      </SectionPanel>
    </Space>
  )
}
