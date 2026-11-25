import {
  ActionIcon,
  Avatar,
  Breadcrumbs,
  Button,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Switch,
  Text,
} from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, Outlet, useLocation, useRouteContext, useRouter } from "@tanstack/react-router"
import {
  Bell,
  Bot,
  ChartColumn,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Gauge,
  Globe2,
  House,
  Languages,
  LogOut,
  MapIcon,
  MenuIcon,
  Monitor,
  Moon,
  Radar,
  ScrollText,
  Settings,
  Shield,
  Sun,
  Table2,
  User,
  Users,
} from "lucide-react"
import { type ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { GlobalSearch } from "../components/global-search"
import { Notifications } from "../components/notifications"
import { type Locale, locales } from "../i18n"
import { exampleMenus, type NavigationEntry } from "../lib/examples"
import { getMenuTitle } from "../lib/menu-title"
import { showRequestError } from "../lib/request-notification"
import { useThemeSettings } from "../lib/theme"
import { signOutMutationOptions } from "../services/auth/mutations"
import { sessionQueryKey } from "../services/auth/queries"
import {
  currentUserMenusQueryKey,
  currentUserMenusQueryOptions,
  currentUserPermissionsQueryKey,
  settingsQueryOptions,
} from "../services/system/queries"

const iconMap = {
  audit: <ScrollText size={16} />,
  ai: <Bot size={16} />,
  analytics: <ChartColumn size={16} />,
  bell: <Bell size={16} />,
  chart3d: <ChartColumn size={16} />,
  dashboard: <Gauge size={16} />,
  chart: <Gauge size={16} />,
  demo: <ClipboardList size={16} />,
  form: <FileText size={16} />,
  globe: <Globe2 size={16} />,
  map: <MapIcon size={16} />,
  menu: <MenuIcon size={16} />,
  monitor: <Monitor size={16} />,
  radar: <Radar size={16} />,
  settings: <Settings size={16} />,
  table: <Table2 size={16} />,
  team: <Shield size={16} />,
  user: <Users size={16} />,
  workbench: <House size={16} />,
}

export function AdminLayout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const location = useLocation()
  const { user } = useRouteContext({ from: "/_admin" })
  const { i18n, t } = useTranslation()
  const locale = locales.includes(i18n.language as Locale) ? (i18n.language as Locale) : "zh-CN"
  const { compact, mode, primaryColor, setCompact, setMode, setPrimaryColor } = useThemeSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [navigationOpen, setNavigationOpen] = useState(false)
  const menusQuery = useQuery(currentUserMenusQueryOptions())
  const settingsQuery = useQuery(settingsQueryOptions())
  const signOutMutation = useMutation(signOutMutationOptions())
  const menus = menusQuery.data ?? []
  const navigationMenus: NavigationEntry[] = [...menus, ...exampleMenus]
  const siteName =
    settingsQuery.data?.find((item) => item.key === "siteName")?.value || t("appName")

  const signOut = async () => {
    await queryClient.cancelQueries({ queryKey: currentUserMenusQueryKey })
    await queryClient.cancelQueries({ queryKey: currentUserPermissionsQueryKey })
    await signOutMutation.mutateAsync()
    await router.navigate({
      to: "/login",
      search: { redirect: location.href },
      replace: true,
    })
    queryClient.removeQueries({ queryKey: sessionQueryKey })
    queryClient.removeQueries({ queryKey: currentUserMenusQueryKey })
    queryClient.removeQueries({ queryKey: currentUserPermissionsQueryKey })
  }

  const menuById = new Map(navigationMenus.map((item) => [item.id, item]))
  const activeMenu = navigationMenus
    .filter(
      (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
    )
    .sort((first, second) => second.path.length - first.path.length)[0]
  const menuBreadcrumbItems = activeMenu
    ? [activeMenu]
        .concat(
          Array.from({ length: navigationMenus.length }).reduce<typeof navigationMenus>(
            (parents, _item) => {
              const previous = parents.at(-1) ?? activeMenu
              const parent = previous.parentId ? menuById.get(previous.parentId) : undefined

              return parent ? parents.concat(parent) : parents
            },
            [],
          ),
        )
        .reverse()
        .map((item, index, items) => ({
          key: item.id,
          title:
            index !== items.length - 1 &&
            !navigationMenus.some((child) => child.parentId === item.id) ? (
              <Link to={item.path} className="ame-text-muted">
                {getMenuTitle(item, t)}
              </Link>
            ) : (
              getMenuTitle(item, t)
            ),
        }))
    : undefined
  const fallbackBreadcrumbItems =
    location.pathname === "/account/settings"
      ? [
          {
            key: "workbench",
            title: (
              <Link to="/dashboard/workbench" className="ame-text-muted">
                {t("workbench")}
              </Link>
            ),
          },
          { key: "user-settings", title: t("userSettings") },
        ]
      : location.pathname === "/forbidden"
        ? [
            {
              key: "workbench",
              title: (
                <Link to="/dashboard/workbench" className="ame-text-muted">
                  {t("workbench")}
                </Link>
              ),
            },
            { key: "forbidden", title: t("forbidden") },
          ]
        : [{ key: "workbench", title: t("workbench") }]
  const breadcrumbItems = menuBreadcrumbItems ?? fallbackBreadcrumbItems

  const navigation = (
    <AdminNavigation
      menus={navigationMenus}
      pathname={location.pathname}
      onNavigate={() => setNavigationOpen(false)}
    />
  )

  return (
    <div className="ame-app-shell flex h-dvh overflow-hidden">
      <a
        href="#main-content"
        className="ame-surface sr-only z-10 rounded-md p-2 focus:not-sr-only focus:absolute focus:m-2"
      >
        {t("skipToContent")}
      </a>
      <aside className="ame-sidebar hidden w-59 shrink-0 flex-col md:flex">
        <div className="ame-brand ame-text flex h-16 shrink-0 items-center gap-3 px-5 text-base font-bold">
          <span className="ame-brand-mark text-sm font-black">AM</span>
          <span className="truncate">{siteName}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{navigation}</div>
        <div className="ame-sidebar-status shrink-0 px-4 py-3 text-[11px] leading-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            System Status
          </div>
          <div className="font-semibold text-emerald-700 dark:text-emerald-300">
            All Systems Operational
          </div>
        </div>
      </aside>
      <Drawer
        title={siteName}
        opened={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        closeButtonProps={{ "aria-label": t("close") }}
        size="xs"
      >
        {navigation}
      </Drawer>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="ame-topbar flex h-16 shrink-0 items-center gap-2 px-3 md:gap-3 md:px-5">
          <ActionIcon
            className="md:hidden"
            variant="subtle"
            aria-label={t("navigation")}
            onClick={() => setNavigationOpen(true)}
          >
            <MenuIcon size={18} />
          </ActionIcon>
          <nav className="mr-auto min-w-0 overflow-hidden" aria-label={t("breadcrumb")}>
            <Breadcrumbs separatorMargin="xs" className="max-md:hidden">
              {breadcrumbItems.map((item, index) => (
                <span
                  key={item.key}
                  className="ame-text-muted truncate"
                  aria-current={index === breadcrumbItems.length - 1 ? "page" : undefined}
                >
                  {item.title}
                </span>
              ))}
            </Breadcrumbs>
          </nav>
          <GlobalSearch menus={navigationMenus} />
          <Notifications />
          <ActionIcon
            variant="subtle"
            className="ame-topbar-icon"
            aria-label={t("theme")}
            aria-pressed={mode === "dark"}
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </ActionIcon>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" className="ame-topbar-icon" aria-label={t("language")}>
                <Languages size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {locales.map((language) => (
                <Menu.Item
                  key={language}
                  leftSection={locale === language ? <Check size={16} /> : <span className="w-4" />}
                  onClick={() => void i18n.changeLanguage(language)}
                >
                  {language === "zh-CN" ? t("simplifiedChinese") : t("english")}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            variant="subtle"
            className="ame-topbar-icon"
            aria-label={t("appearance")}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={18} />
          </ActionIcon>
          <Menu position="bottom-end">
            <Menu.Target>
              <Button
                variant="subtle"
                className="ame-shell-user px-2"
                aria-label={t("userSettings")}
              >
                <Group gap={10} wrap="nowrap">
                  <Avatar size={28} src={user.image} alt="">
                    <User size={16} />
                  </Avatar>
                  <span className="hidden flex-col items-start leading-tight lg:flex">
                    <span className="ame-text max-w-40 truncate font-semibold">{user.name}</span>
                    <span className="ame-text-subtle max-w-40 truncate text-xs">{user.email}</span>
                  </span>
                  <ChevronDown size={14} className="ame-text-subtle" />
                </Group>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                <Text size="sm" fw={600}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              </Menu.Label>
              <Menu.Divider />
              <Menu.Item component={Link} to="/account/settings" leftSection={<User size={16} />}>
                {t("userSettings")}
              </Menu.Item>
              <Menu.Item
                leftSection={<LogOut size={16} />}
                disabled={signOutMutation.isPending}
                onClick={() =>
                  void signOut().catch((error) => showRequestError(error, t("requestFailed")))
                }
              >
                {t("signOut")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Drawer
            title={t("appearance")}
            position="right"
            opened={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            closeButtonProps={{ "aria-label": t("close") }}
          >
            <Stack>
              <Group justify="space-between">
                <label htmlFor="primary-color">{t("primaryColor")}</label>
                <input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.currentTarget.value)}
                  className="ame-border h-8 w-11 cursor-pointer rounded border bg-transparent p-0.5"
                />
              </Group>
              <Switch
                label={t("compactMode")}
                checked={compact}
                onChange={(event) => setCompact(event.currentTarget.checked)}
              />
            </Stack>
          </Drawer>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="ame-content ame-page-bg min-h-0 flex-1 overflow-auto p-3 md:p-5"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminNavigation({
  menus,
  pathname,
  onNavigate,
}: {
  menus: NavigationEntry[]
  pathname: string
  onNavigate: () => void
}) {
  const { t } = useTranslation()
  const [manualExpansion, setManualExpansion] = useState<Record<string, boolean>>({})
  const [previousPathname, setPreviousPathname] = useState(pathname)
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname)
    // A manual collapse applies until the next navigation.
    setManualExpansion((groups) =>
      Object.fromEntries(Object.entries(groups).filter(([, opened]) => opened)),
    )
  }
  const menuIds = new Set(menus.map((item) => item.id))
  const visible = menus.filter((item) => item.visible)

  function iconFor(item: NavigationEntry): ReactNode {
    return iconMap[item.icon as keyof typeof iconMap] ?? <MenuIcon size={16} />
  }

  return (
    <nav aria-label={t("navigation")} className="px-2 py-2">
      {visible
        .filter((item) => !item.parentId || !menuIds.has(item.parentId))
        .map((item) => {
          const children = visible.filter((child) => child.parentId === item.id)

          if (!children.length) {
            return (
              <NavLink
                component={Link}
                key={item.id}
                to={item.path}
                label={getMenuTitle(item, t)}
                leftSection={iconFor(item)}
                active={item.path === pathname}
                onClick={onNavigate}
              />
            )
          }

          const childActive = children.some((child) => child.path === pathname)
          return (
            <NavLink
              component="button"
              type="button"
              key={item.id}
              label={getMenuTitle(item, t)}
              leftSection={iconFor(item)}
              opened={manualExpansion[item.id] ?? childActive}
              onChange={(opened) =>
                setManualExpansion((groups) => ({ ...groups, [item.id]: opened }))
              }
            >
              {children.map((child) => (
                <NavLink
                  component={Link}
                  key={child.id}
                  to={child.path}
                  label={getMenuTitle(child, t)}
                  leftSection={iconFor(child)}
                  active={child.path === pathname}
                  onClick={onNavigate}
                />
              ))}
            </NavLink>
          )
        })}
    </nav>
  )
}
