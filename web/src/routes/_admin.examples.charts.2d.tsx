import { createFileRoute } from "@tanstack/react-router"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { LinearGradient } from "@visx/gradient"
import { Group } from "@visx/group"
import { ParentSize } from "@visx/responsive"
import { scaleBand, scaleLinear, scalePoint } from "@visx/scale"
import { AreaClosed, Bar, LinePath } from "@visx/shape"
import { Space, Tag } from "antd"
import { useTranslation } from "react-i18next"
import { MetricCard, MetricStrip, PageHeader, SectionPanel } from "../components/design-system"

export const Route = createFileRoute("/_admin/examples/charts/2d")({
  component: Charts2dRoute,
})

const trend = [
  { label: "Jan", value: 38, revenue: 18 },
  { label: "Feb", value: 52, revenue: 24 },
  { label: "Mar", value: 48, revenue: 29 },
  { label: "Apr", value: 71, revenue: 38 },
  { label: "May", value: 66, revenue: 43 },
  { label: "Jun", value: 84, revenue: 52 },
  { label: "Jul", value: 92, revenue: 61 },
]

const channels = [
  { label: "Organic", value: 46, color: "#2563eb" },
  { label: "Referral", value: 28, color: "#14b8a6" },
  { label: "Campaign", value: 18, color: "#f97316" },
  { label: "Partner", value: 8, color: "#8b5cf6" },
]

function TrendChart({ width, height }: { width: number; height: number }) {
  const margin = { top: 18, right: 28, bottom: 34, left: 42 }
  const innerWidth = Math.max(width - margin.left - margin.right, 0)
  const innerHeight = Math.max(height - margin.top - margin.bottom, 0)
  const xScale = scalePoint({
    domain: trend.map((item) => item.label),
    range: [0, innerWidth],
    padding: 0.35,
  })
  const yScale = scaleLinear({
    domain: [0, 100],
    range: [innerHeight, 0],
    nice: true,
  })

  return (
    <svg width={width} height={height} role="img" aria-label="Operational trend chart">
      <LinearGradient id="visx-trend-fill" from="#2563eb" to="#2563eb" toOpacity={0.05} />
      <Group left={margin.left} top={margin.top}>
        <AxisLeft
          scale={yScale}
          numTicks={4}
          stroke="var(--ame-border)"
          tickStroke="var(--ame-border)"
          tickLabelProps={{ fill: "var(--ame-text-subtle)", fontSize: 11, textAnchor: "end" }}
        />
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="var(--ame-border)"
          tickStroke="var(--ame-border)"
          tickLabelProps={{ fill: "var(--ame-text-subtle)", fontSize: 11, textAnchor: "middle" }}
        />
        <AreaClosed
          data={trend}
          x={(item) => xScale(item.label) ?? 0}
          y={(item) => yScale(item.value)}
          yScale={yScale}
          fill="url(#visx-trend-fill)"
          curve={undefined}
        />
        <LinePath
          data={trend}
          x={(item) => xScale(item.label) ?? 0}
          y={(item) => yScale(item.value)}
          stroke="#2563eb"
          strokeWidth={3}
        />
        {trend.map((item) => (
          <circle
            key={item.label}
            cx={xScale(item.label)}
            cy={yScale(item.value)}
            r={4}
            fill="#fff"
            stroke="#2563eb"
            strokeWidth={2}
          />
        ))}
      </Group>
    </svg>
  )
}

function ChannelChart({ width, height }: { width: number; height: number }) {
  const margin = { top: 8, right: 16, bottom: 28, left: 18 }
  const innerWidth = Math.max(width - margin.left - margin.right, 0)
  const innerHeight = Math.max(height - margin.top - margin.bottom, 0)
  const xScale = scaleBand({
    domain: channels.map((item) => item.label),
    range: [0, innerWidth],
    padding: 0.34,
  })
  const yScale = scaleLinear({
    domain: [0, 55],
    range: [innerHeight, 0],
    nice: true,
  })

  return (
    <svg width={width} height={height} role="img" aria-label="Channel share bar chart">
      <Group left={margin.left} top={margin.top}>
        {channels.map((item) => {
          const barWidth = xScale.bandwidth()
          const barHeight = innerHeight - yScale(item.value)
          const x = xScale(item.label) ?? 0
          const y = yScale(item.value)

          return (
            <Bar
              key={item.label}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={8}
              fill={item.color}
            />
          )
        })}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="transparent"
          tickStroke="transparent"
          tickLabelProps={{ fill: "var(--ame-text-subtle)", fontSize: 11, textAnchor: "middle" }}
        />
      </Group>
    </svg>
  )
}

function Charts2dRoute() {
  const { t } = useTranslation()

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <PageHeader eyebrow="Examples" title={t("charts2d")} description={t("charts2dDescription")} />
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
      <div className="ame-card-grid">
        <SectionPanel title={t("trendChart")}>
          <div className="h-80">
            <ParentSize>
              {({ width, height }) => <TrendChart width={width} height={height} />}
            </ParentSize>
          </div>
        </SectionPanel>
        <SectionPanel title={t("shareChart")}>
          <div className="h-80">
            <ParentSize>
              {({ width, height }) => <ChannelChart width={width} height={height} />}
            </ParentSize>
          </div>
          <div className="flex flex-wrap gap-2">
            {channels.map((item) => (
              <Tag key={item.label} color={item.color}>
                {item.label} · {item.value}%
              </Tag>
            ))}
          </div>
        </SectionPanel>
      </div>
    </Space>
  )
}
