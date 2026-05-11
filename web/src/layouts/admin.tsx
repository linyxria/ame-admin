import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, Outlet, useLocation, useRouteContext, useRouter } from "@tanstack/react-router"
import type { MenuProps } from "antd"
import {
  Menu,
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Space,
  Switch,
  Typography,
} from "antd"
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
  Palette,
  Radar,
  ScrollText,
  Settings,
  Shield,
  Sun,
  Table2,
  User,
  Users,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { GlobalSearch } from "../components/global-search"
import { Notifications } from "../components/notifications"
import { type Locale, locales } from "../i18n"
import { exampleMenus, type NavigationEntry } from "../lib/examples"
import { getMenuTitle } from "../lib/menu-title"
import { useThemeSettings } from "../lib/theme"
import { signOutMutationOptions } from "../services/auth/mutations"
import { sessionQueryKey } from "../services/auth/queries"
import {
  currentUserMenusQueryKey,
  currentUserMenusQueryOptions,
  currentUserPermissionsQueryKey,
  settingsQueryOptions,
} from "../services/system/queries"

const { Header, Sider, Content } = Layout

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

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      disabled: true,
      label: (
        <div className="min-w-48 py-1">
          <div className="ame-text font-medium">{user.name}</div>
          <div className="ame-text-subtle mt-0.5 text-xs">{user.email}</div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "user-settings",
      icon: <User size={16} />,
      label: <Link to="/account/settings">{t("userSettings")}</Link>,
    },
    {
      key: "sign-out",
      icon: <LogOut size={16} />,
      label: t("signOut"),
      onClick: signOut,
    },
  ]

  const languageMenuItems: MenuProps["items"] = [
    {
      key: "zh-CN",
      icon: locale === "zh-CN" ? <Check size={16} /> : <span className="w-4" />,
      label: t("simplifiedChinese"),
      onClick: () => void i18n.changeLanguage("zh-CN"),
    },
    {
      key: "en-US",
      icon: locale === "en-US" ? <Check size={16} /> : <span className="w-4" />,
      label: t("english"),
      onClick: () => void i18n.changeLanguage("en-US"),
    },
  ]

  const menuItems: MenuProps["items"] = navigationMenus
    .filter(
      (item) =>
        item.visible &&
        (!item.parentId || !navigationMenus.some((parent) => parent.id === item.parentId)),
    )
    .map((item) => {
      const children = navigationMenus.filter(
        (child) => child.visible && child.parentId === item.id,
      )

      return {
        key: item.path,
        icon: item.icon ? iconMap[item.icon as keyof typeof iconMap] : <MenuIcon size={16} />,
        label: children.length ? (
          getMenuTitle(item, t)
        ) : (
          <Link to={item.path}>{getMenuTitle(item, t)}</Link>
        ),
        children: children.length
          ? children.map((child) => ({
              key: child.path,
              icon: child.icon ? (
                iconMap[child.icon as keyof typeof iconMap]
              ) : (
                <MenuIcon size={16} />
              ),
              label: <Link to={child.path}>{getMenuTitle(child, t)}</Link>,
            }))
          : undefined,
      }
    })

  const defaultOpenKeys = navigationMenus
    .filter((item) =>
      navigationMenus.some(
        (child) => child.parentId === item.id && child.path === location.pathname,
      ),
    )
    .map((item) => item.path)

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
            title: (
              <Link to="/dashboard/workbench" className="ame-text-muted">
                {t("workbench")}
              </Link>
            ),
          },
          { title: t("userSettings") },
        ]
      : location.pathname === "/forbidden"
        ? [
            {
              title: (
                <Link to="/dashboard/workbench" className="ame-text-muted">
                  {t("workbench")}
                </Link>
              ),
            },
            { title: t("forbidden") },
          ]
        : [{ title: t("workbench") }]
  const breadcrumbItems = menuBreadcrumbItems ?? fallbackBreadcrumbItems

  return (
    <Layout className="ame-app-shell h-screen overflow-hidden max-[760px]:min-w-215">
      <Sider className="ame-sidebar h-screen overflow-hidden" width={236} theme={mode}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="ame-brand ame-text flex h-16 shrink-0 items-center gap-3 px-5 text-base font-bold">
            <span className="ame-brand-mark text-sm font-black">AM</span>
            <span className="truncate">{siteName}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Menu
              theme={mode}
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={defaultOpenKeys}
              items={menuItems}
            />
          </div>
          <div className="ame-sidebar-status shrink-0 px-4 py-3 text-[11px] leading-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              System Status
            </div>
            <div className="font-semibold text-emerald-300">All Systems Operational</div>
          </div>
        </div>
      </Sider>
      <Layout className="min-h-0">
        <Header className="ame-topbar flex shrink-0 items-center gap-3">
          <Breadcrumb className="mr-auto min-w-0" items={breadcrumbItems} />
          <GlobalSearch menus={navigationMenus} />
          <Notifications />
          <Button
            type="text"
            className="ame-topbar-icon"
            icon={mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          />
          <Dropdown
            menu={{ items: languageMenuItems, selectedKeys: [locale] }}
            placement="bottomRight"
          >
            <Button type="text" className="ame-topbar-icon" icon={<Languages size={18} />} />
          </Dropdown>
          <Button
            type="text"
            className="ame-topbar-icon"
            icon={<Settings size={18} />}
            onClick={() => setSettingsOpen(true)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="link" className="ame-shell-user px-2">
              <Space size={10}>
                <Avatar src={user.image} icon={!user.image ? <User size={16} /> : undefined} />
                <span className="flex flex-col items-start leading-tight">
                  <Typography.Text strong className="max-w-40 truncate">
                    {user.name}
                  </Typography.Text>
                  <span className="ame-text-subtle max-w-40 truncate text-xs">{user.email}</span>
                </span>
                <ChevronDown size={14} className="ame-text-subtle" />
              </Space>
            </Button>
          </Dropdown>
          <Drawer
            title={t("appearance")}
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <Space size={10}>
                  <Palette size={18} />
                  <Typography.Text>{t("primaryColor")}</Typography.Text>
                </Space>
                <input
                  aria-label={t("primaryColor")}
                  type="color"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="ame-border h-8 w-11 cursor-pointer rounded border bg-transparent p-0.5"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Space size={10}>
                  <Settings size={18} />
                  <Typography.Text>{t("compactMode")}</Typography.Text>
                </Space>
                <Switch checked={compact} onChange={setCompact} />
              </div>
            </div>
          </Drawer>
        </Header>
        <Content className="ame-content ame-page-bg min-h-0 overflow-auto p-5">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
