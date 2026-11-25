import { Group, type GroupProps, EmptyState as MantineEmptyState } from "@mantine/core"
import type { ReactNode } from "react"

export function PageHeader({
  actions,
  className = "",
  children,
  description,
  eyebrow,
  status,
  title,
}: {
  actions?: ReactNode
  className?: string
  children?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  status?: ReactNode
  title: ReactNode
}) {
  return (
    <section className={`ame-page-header ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow ? <div className="ame-page-eyebrow">{eyebrow}</div> : null}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="ame-page-title">{title}</h1>
          {status}
        </div>
        {description ? <p className="ame-page-description">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="ame-page-actions">{actions}</div> : null}
    </section>
  )
}

export function MetricStrip({ children }: { children: ReactNode }) {
  return <section className="ame-metric-strip">{children}</section>
}

export function MetricCard({
  delta,
  icon,
  label,
  tone = "blue",
  value,
}: {
  delta?: ReactNode
  icon?: ReactNode
  label: ReactNode
  tone?: "blue" | "green" | "orange" | "slate"
  value: ReactNode
}) {
  return (
    <div className="ame-metric-card" data-tone={tone}>
      {icon ? <div className="ame-metric-icon">{icon}</div> : null}
      <div className="min-w-0">
        <div className="ame-metric-label">{label}</div>
        <div className="ame-metric-value">{value}</div>
        {delta ? <div className="ame-metric-delta">{delta}</div> : null}
      </div>
    </div>
  )
}

export function SectionPanel({
  actions,
  children,
  className = "",
  title,
}: {
  actions?: ReactNode
  children: ReactNode
  className?: string
  title?: ReactNode
}) {
  return (
    <section className={`ame-section-panel ${className}`.trim()}>
      {title || actions ? (
        <div className="ame-section-panel-header">
          {title ? <h2>{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      <div className="ame-section-panel-body">{children}</div>
    </section>
  )
}

export function ToolbarSurface({ children, ...props }: GroupProps) {
  return (
    <Group gap="xs" {...props} className={`ame-toolbar-surface ${props.className ?? ""}`.trim()}>
      {children}
    </Group>
  )
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "blue" | "green" | "orange" | "red" | "neutral"
}) {
  return (
    <span className="ame-status-pill" data-tone={tone}>
      {children}
    </span>
  )
}

export function EmptyState({ description }: { description: ReactNode }) {
  return <MantineEmptyState className="ame-empty-state" description={description} />
}

export function HudPanel({
  actions,
  children,
  className = "",
  title,
}: {
  actions?: ReactNode
  children: ReactNode
  className?: string
  title?: ReactNode
}) {
  return (
    <section className={`ame-hud-panel ${className}`.trim()}>
      {title || actions ? (
        <div className="ame-hud-panel-header">
          {title ? <h2>{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}
