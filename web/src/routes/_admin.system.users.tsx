import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  App,
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd"
import { KeyRound, LogOut, Pencil, Plus, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { type SystemUser, systemApi, systemQueryKeys } from "../lib/system-api"

export const Route = createFileRoute("/_admin/system/users")({
  component: UsersRoute,
})

type UserForm = {
  name: string
  email: string
  password?: string
  roleIds: string[]
}

function UsersRoute() {
  const [form] = Form.useForm<UserForm>()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SystemUser | null>(null)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [resetting, setResetting] = useState<SystemUser | null>(null)
  const [password, setPassword] = useState("")

  const usersQuery = useQuery({
    queryKey: systemQueryKeys.users,
    queryFn: systemApi.users,
  })
  const rolesQuery = useQuery({
    queryKey: systemQueryKeys.roles,
    queryFn: systemApi.roles,
  })
  const permissionsQuery = useQuery({
    queryKey: systemQueryKeys.myPermissions,
    queryFn: systemApi.myPermissions,
  })
  const userActions =
    permissionsQuery.data?.find((item) => item.path === "/system/users")?.actions ?? []
  const canCreate = userActions.includes("create")
  const canUpdate = userActions.includes("update")
  const canDelete = userActions.includes("delete")
  const users = (usersQuery.data ?? []).filter((item) =>
    `${item.name} ${item.email} ${item.roles.map((role) => role.name).join(" ")}`
      .toLowerCase()
      .includes(keyword.toLowerCase()),
  )

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.users }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.roles }),
    ])
  }

  const createUser = useMutation({
    mutationFn: systemApi.createUser,
    onSuccess: refresh,
  })
  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof systemApi.updateUser>[1] }) =>
      systemApi.updateUser(id, body),
    onSuccess: refresh,
  })
  const deleteUser = useMutation({
    mutationFn: systemApi.deleteUser,
    onSuccess: refresh,
  })
  const resetPassword = useMutation({
    mutationFn: ({ id, nextPassword }: { id: string; nextPassword: string }) =>
      systemApi.resetUserPassword(id, nextPassword),
    onSuccess: refresh,
  })
  const revokeSessions = useMutation({
    mutationFn: systemApi.revokeUserSessions,
    onSuccess: refresh,
  })

  const showModal = (user?: SystemUser) => {
    setEditing(user ?? null)
    form.setFieldsValue(
      user
        ? {
            name: user.name,
            email: user.email,
            roleIds: user.roles.map((role) => role.id),
          }
        : { name: "", email: "", password: "", roleIds: [] },
    )
    setOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()

    try {
      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          body: {
            name: values.name,
            email: values.email,
            roleIds: values.roleIds ?? [],
          },
        })
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password ?? "",
          roleIds: values.roleIds ?? [],
        })
      }
      message.success("保存成功")
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存失败")
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id)
      message.success("删除成功")
    } catch (error) {
      message.error(error instanceof Error ? error.message : "删除失败")
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">用户管理</h1>
          <p className="ame-page-description text-sm">维护后台账号和用户角色。</p>
        </div>
        <Space>
          <Button
            icon={<RotateCw size={16} />}
            onClick={() => {
              void refresh()
            }}
          />
          <Button
            type="primary"
            disabled={!canCreate}
            icon={<Plus size={16} />}
            onClick={() => showModal()}
          >
            新建用户
          </Button>
        </Space>
      </div>

      <Table<SystemUser>
        rowKey="id"
        loading={usersQuery.isLoading || rolesQuery.isLoading}
        dataSource={users}
        pagination={{ showSizeChanger: true }}
        title={() => (
          <Input.Search
            allowClear
            className="max-w-sm"
            placeholder="搜索姓名、邮箱或角色"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        )}
        columns={[
          {
            title: "用户",
            render: (_, record) => (
              <Space>
                <Avatar src={record.image}>{record.name.slice(0, 1)}</Avatar>
                <span>{record.name}</span>
              </Space>
            ),
          },
          { title: "邮箱", dataIndex: "email" },
          {
            title: "角色",
            dataIndex: "roles",
            render: (value: SystemUser["roles"]) =>
              value.length > 0 ? (
                value.map((role) => <Tag key={role.id}>{role.name}</Tag>)
              ) : (
                <span className="ame-text-subtle">未分配</span>
              ),
          },
          {
            title: "状态",
            dataIndex: "enabled",
            width: 110,
            render: (enabled, record) => (
              <Switch
                size="small"
                checked={enabled}
                disabled={record.builtIn || !canUpdate}
                checkedChildren="启用"
                unCheckedChildren="停用"
                onChange={(checked) =>
                  updateUser.mutate({
                    id: record.id,
                    body: { enabled: checked },
                  })
                }
              />
            ),
          },
          {
            title: "邮箱验证",
            dataIndex: "emailVerified",
            width: 110,
            render: (verified) => (
              <Tag color={verified ? "green" : "default"}>{verified ? "已验证" : "未验证"}</Tag>
            ),
          },
          {
            title: "操作",
            width: 150,
            render: (_, record) => (
              <Space>
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    disabled={!canUpdate}
                    icon={<Pencil size={16} />}
                    onClick={() => showModal(record)}
                  />
                </Tooltip>
                <Tooltip title="重置密码">
                  <Button
                    type="text"
                    disabled={!canUpdate}
                    icon={<KeyRound size={16} />}
                    onClick={() => {
                      setResetting(record)
                      setPassword("")
                    }}
                  />
                </Tooltip>
                <Tooltip title="强制重新登录">
                  <Popconfirm
                    title="确认让这个用户的所有会话失效？"
                    onConfirm={() => revokeSessions.mutate(record.id)}
                    disabled={!canUpdate}
                  >
                    <Button type="text" disabled={!canUpdate} icon={<LogOut size={16} />} />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title={record.builtIn ? "内置系统管理员不允许删除" : "删除"}>
                  <Popconfirm
                    title="确认删除这个用户？"
                    onConfirm={() => remove(record.id)}
                    disabled={record.builtIn || !canDelete}
                  >
                    <Button
                      type="text"
                      danger
                      disabled={record.builtIn || !canDelete}
                      icon={<Trash2 size={16} />}
                    />
                  </Popconfirm>
                </Tooltip>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "编辑用户" : "新建用户"}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: "email", message: "请输入有效邮箱" }]}
          >
            <Input />
          </Form.Item>
          {!editing ? (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 8, message: "密码至少 8 位" }]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}
          <Form.Item name="roleIds" label="角色">
            <Select
              mode="multiple"
              options={(rolesQuery.data ?? []).map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`重置密码 · ${resetting?.name ?? ""}`}
        open={Boolean(resetting)}
        okButtonProps={{ loading: resetPassword.isPending }}
        onCancel={() => setResetting(null)}
        onOk={async () => {
          if (!resetting) {
            return
          }
          if (password.length < 8) {
            message.error("密码至少 8 位")
            return
          }
          try {
            await resetPassword.mutateAsync({ id: resetting.id, nextPassword: password })
            message.success("密码已重置")
            setResetting(null)
          } catch (error) {
            message.error(error instanceof Error ? error.message : "重置失败")
          }
        }}
      >
        <Input.Password
          value={password}
          minLength={8}
          placeholder="输入新的临时密码"
          onChange={(event) => setPassword(event.target.value)}
        />
      </Modal>
    </Space>
  )
}
