import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useRouteContext, useRouter } from '@tanstack/react-router'
import type { MenuProps } from 'antd'
import { Menu as AntMenu, Avatar, Button, Dropdown, Layout, Space, Typography } from 'antd'
import {
  ChevronDown,
  Gauge,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { systemApi, systemQueryKeys } from '../lib/system-api'

const { Header, Sider, Content } = Layout

const iconMap = {
  dashboard: <Gauge size={16} />,
  menu: <MenuIcon size={16} />,
  settings: <Settings size={16} />,
  team: <Shield size={16} />,
  user: <Users size={16} />,
}

export function AdminLayout() {
  const router = useRouter()
  const location = useLocation()
  const { user, auth } = useRouteContext({ from: '/_admin' })
  const menusQuery = useQuery({
    queryKey: systemQueryKeys.myMenus,
    queryFn: systemApi.myMenus,
  })
  const menus = menusQuery.data ?? []

  const signOut = async () => {
    await auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          void router.navigate({
            to: '/login',
            search: { redirect: location.href },
            replace: true,
          })
        },
      },
    })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      disabled: true,
      label: (
        <div className="min-w-48 py-1">
          <div className="font-medium text-slate-900">{user.name}</div>
          <div className="mt-0.5 text-xs text-slate-500">{user.email}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'sign-out',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: signOut,
    },
  ]

  const menuItems: MenuProps['items'] = menus
    .filter((item) => !item.parentId || !menus.some((parent) => parent.id === item.parentId))
    .map((item) => {
      const children = menus.filter((child) => child.parentId === item.id)

      return {
        key: item.path,
        icon: item.icon ? iconMap[item.icon as keyof typeof iconMap] : <MenuIcon size={16} />,
        label: children.length ? item.title : <Link to={item.path}>{item.title}</Link>,
        children: children.length
          ? children.map((child) => ({
              key: child.path,
              icon: child.icon ? (
                iconMap[child.icon as keyof typeof iconMap]
              ) : (
                <MenuIcon size={16} />
              ),
              label: <Link to={child.path}>{child.title}</Link>,
            }))
          : undefined,
      }
    })

  const defaultOpenKeys = menus
    .filter((item) =>
      menus.some((child) => child.parentId === item.id && child.path === location.pathname),
    )
    .map((item) => item.path)

  return (
    <Layout className="min-h-screen max-[760px]:min-w-215">
      <Sider className="min-h-screen border-r border-slate-200" width={224} theme="light">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 text-base font-bold text-slate-900">
          AME 管理后台
        </div>
        <AntMenu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={defaultOpenKeys}
          className="border-e-0 px-2 pt-3"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end border-b border-slate-200">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="link" className="h-11 px-2">
              <Space size={10}>
                <Avatar src={user.image} icon={!user.image ? <User size={16} /> : undefined} />
                <span className="flex flex-col items-start leading-tight">
                  <Typography.Text strong className="max-w-40 truncate">
                    {user.name}
                  </Typography.Text>
                  <span className="max-w-40 truncate text-xs text-slate-500">{user.email}</span>
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content className="bg-slate-100 p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
