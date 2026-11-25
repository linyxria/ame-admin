import { Avatar, Badge, Button, Group, Indicator, Stack } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"
import { ArrowRight, Bell, Clock3, Settings, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  EmptyState,
  MetricCard,
  MetricStrip,
  PageHeader,
  SectionPanel,
  StatusPill,
} from "../components/design-system"
import { getMenuTitle } from "../lib/menu-title"
import { currentUserMenusQueryOptions, notificationsQueryOptions } from "../services/system/queries"

export const Route = createFileRoute("/_admin/dashboard/workbench")({
  component: WorkbenchRoute,
})

function formatTime(value: Date | string) {
  return new Date(value).toLocaleString()
}

function WorkbenchRoute() {
  const { user } = useRouteContext({ from: "/_admin" })
  const { t } = useTranslation()
  const menusQuery = useQuery(currentUserMenusQueryOptions())
  const notificationsQuery = useQuery(notificationsQueryOptions({ page: 1, pageSize: 5 }))
  const menus = menusQuery.data ?? []
  const shortcutMenus = menus
    .filter((item) => item.path !== "/dashboard")
    .filter((item) => !menus.some((child) => child.parentId === item.id))
    .slice(0, 8)
  const notifications = notificationsQuery.data?.items ?? []
  const unreadTotal = notificationsQuery.data?.unreadTotal ?? 0

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Overview"
        title={t("workbench")}
        description={t("workbenchDescription", { name: user.name })}
        status={<StatusPill tone="green">Live</StatusPill>}
        actions={
          <Button component={Link} to="/notifications" leftSection={<Bell size={16} />}>
            {t("viewNotifications")}
          </Button>
        }
      />

      <MetricStrip>
        <MetricCard
          icon={
            <Indicator
              disabled={!unreadTotal}
              label={unreadTotal > 99 ? "99+" : unreadTotal}
              size={16}
            >
              <Bell size={20} />
            </Indicator>
          }
          label={t("unreadNotifications")}
          value={unreadTotal}
          delta="+4.2% vs 24h ago"
          tone="blue"
        />
        <MetricCard
          icon={
            <Avatar size={28} src={user.image} alt="">
              <User size={16} />
            </Avatar>
          }
          label={t("currentUser")}
          value={<span className="truncate">{user.name}</span>}
          delta="Administrator workspace"
          tone="slate"
        />
        <MetricCard
          icon={<Settings size={20} />}
          label={t("availableEntries")}
          value={shortcutMenus.length}
          delta="Role-based entries"
          tone="green"
        />
      </MetricStrip>

      <div className="ame-card-grid">
        <div>
          <SectionPanel
            title={t("quickAccess")}
            actions={
              <Button
                component={Link}
                to="/account/settings"
                variant="subtle"
                rightSection={<ArrowRight size={15} />}
              >
                {t("userSettings")}
              </Button>
            }
          >
            {shortcutMenus.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {shortcutMenus.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="ame-border ame-hover-surface block rounded-md border px-4 py-3"
                  >
                    <div className="ame-text font-medium">{getMenuTitle(item, t)}</div>
                    <div className="ame-text-subtle mt-1 truncate text-xs">{item.path}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState description={t("noAvailableEntries")} />
            )}
          </SectionPanel>
        </div>
        <div>
          <SectionPanel
            title={t("latestNotifications")}
            actions={
              <Button component={Link} to="/notifications" variant="subtle">
                {t("viewMore")}
              </Button>
            }
          >
            {notifications.length ? (
              <div className="divide-y divide-(--ame-border)">
                {notifications.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <div className="min-w-0">
                        <div className="ame-text truncate font-medium">{item.title}</div>
                        <div className="ame-text-muted mt-1 line-clamp-2 text-sm">
                          {item.description || "-"}
                        </div>
                        <div className="ame-text-subtle mt-1 flex items-center gap-1 text-xs">
                          <Clock3 size={13} />
                          {formatTime(item.createdAt)}
                        </div>
                      </div>
                      <Badge variant="light" color={item.readAt ? "gray" : "blue"}>
                        {item.readAt ? t("read") : t("unread")}
                      </Badge>
                    </Group>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState description={t("noNotifications")} />
            )}
          </SectionPanel>
        </div>
      </div>
    </Stack>
  )
}
