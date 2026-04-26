import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useRouteContext, useRouter } from '@tanstack/react-router'
import type { MenuProps } from 'antd'
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'

const { Header, Sider, Content } = Layout

export function AdminLayout() {
  const router = useRouter()
  const location = useLocation()
  const { user, auth } = useRouteContext({ from: '/_admin' })

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
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: signOut,
    },
  ]

  return (
    <Layout className="min-h-screen max-[760px]:min-w-215">
      <Sider className="min-h-screen border-r border-slate-200" width={224} theme="light">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 text-base font-bold text-slate-900">
          AME 管理后台
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={['dashboard']}
          className="border-e-0 px-2 pt-3"
          items={[
            {
              key: 'dashboard',
              icon: <UserOutlined />,
              label: <Link to="/dashboard">控制台</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end border-b border-slate-200">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="link" className="h-11 px-2">
              <Space size={10}>
                <Avatar src={user.image} icon={!user.image ? <UserOutlined /> : undefined} />
                <span className="flex flex-col items-start leading-tight">
                  <Typography.Text strong className="max-w-40 truncate">
                    {user.name}
                  </Typography.Text>
                  <span className="max-w-40 truncate text-xs text-slate-500">{user.email}</span>
                </span>
                <DownOutlined className="text-xs text-slate-400" />
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
