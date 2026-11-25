import { Progress, Stack } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import { Activity, Cpu, Database, Server } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  MetricCard,
  MetricStrip,
  PageHeader,
  SectionPanel,
  StatusPill,
} from "../components/design-system"

export const Route = createFileRoute("/_admin/dashboard/monitor")({
  component: MonitorRoute,
})

const services = [
  { name: "API Gateway", status: "healthy", latency: 42, load: 58 },
  { name: "PostgreSQL", status: "healthy", latency: 18, load: 46 },
  { name: "Queue Worker", status: "watching", latency: 96, load: 72 },
]

function MonitorRoute() {
  const { t } = useTranslation()

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Operations"
        title={t("monitor")}
        description={t("monitorDescription")}
        status={<StatusPill tone="green">Live</StatusPill>}
      />
      <MetricStrip>
        <MetricCard icon={<Server size={20} />} label={t("uptime")} value="99.98%" tone="green" />
        <MetricCard icon={<Activity size={20} />} label={t("latency")} value="42ms" tone="blue" />
        <MetricCard icon={<Cpu size={20} />} label={t("cpuUsage")} value="58%" tone="orange" />
        <MetricCard
          icon={<Database size={20} />}
          label={t("storageUsage")}
          value="64%"
          tone="slate"
        />
      </MetricStrip>
      <SectionPanel title={t("serviceHealth")}>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          {services.map((service) => (
            <div key={service.name} className="ame-border rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="ame-text font-medium">{service.name}</div>
                <StatusPill tone={service.status === "healthy" ? "green" : "orange"}>
                  {service.status}
                </StatusPill>
              </div>
              <div className="ame-text-subtle mt-3 flex flex-wrap justify-between gap-x-3 text-sm">
                <span>
                  {t("latency")}: {service.latency}ms
                </span>
                <span>
                  {t("serviceLoad")}: {service.load}%
                </span>
              </div>
              <Progress
                className="mt-2"
                value={service.load}
                size="sm"
                aria-label={`${service.name} · ${t("serviceLoad")}`}
              />
            </div>
          ))}
        </div>
      </SectionPanel>
    </Stack>
  )
}
