import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
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
  Table,
  Tag,
  Tooltip,
} from 'antd'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type SystemUser, systemApi, systemQueryKeys } from '../lib/system-api'

export const Route = createFileRoute('/_admin/system/users')({
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

  const usersQuery = useQuery({
    queryKey: systemQueryKeys.users,
    queryFn: systemApi.users,
  })
  const rolesQuery = useQuery({
    queryKey: systemQueryKeys.roles,
    queryFn: systemApi.roles,
  })

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

  const showModal = (user?: SystemUser) => {
    setEditing(user ?? null)
    form.setFieldsValue(
      user
        ? {
            name: user.name,
            email: user.email,
            roleIds: user.roles.map((role) => role.id),
          }
        : { name: '', email: '', password: '', roleIds: [] },
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
          password: values.password ?? '',
          roleIds: values.roleIds ?? [],
        })
      }
      message.success('保存成功')
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id)
      message.success('删除成功')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold text-slate-900">用户管理</h1>
          <p className="text-sm text-slate-600">维护后台账号和用户角色。</p>
        </div>
        <Space>
          <Button
            icon={<RotateCw size={16} />}
            onClick={() => {
              void refresh()
            }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => showModal()}>
            新建用户
          </Button>
        </Space>
      </div>

      <Table<SystemUser>
        rowKey="id"
        loading={usersQuery.isLoading || rolesQuery.isLoading}
        dataSource={usersQuery.data ?? []}
        columns={[
          {
            title: '用户',
            render: (_, record) => (
              <Space>
                <Avatar src={record.image}>{record.name.slice(0, 1)}</Avatar>
                <span>{record.name}</span>
              </Space>
            ),
          },
          { title: '邮箱', dataIndex: 'email' },
          {
            title: '角色',
            dataIndex: 'roles',
            render: (value: SystemUser['roles']) =>
              value.length > 0 ? (
                value.map((role) => <Tag key={role.id}>{role.name}</Tag>)
              ) : (
                <span className="text-slate-400">未分配</span>
              ),
          },
          {
            title: '邮箱验证',
            dataIndex: 'emailVerified',
            width: 110,
            render: (verified) => (
              <Tag color={verified ? 'green' : 'default'}>{verified ? '已验证' : '未验证'}</Tag>
            ),
          },
          {
            title: '操作',
            width: 150,
            render: (_, record) => (
              <Space>
                <Tooltip title="编辑">
                  <Button
                    type="text"
                    icon={<Pencil size={16} />}
                    onClick={() => showModal(record)}
                  />
                </Tooltip>
                <Tooltip title={record.builtIn ? '内置系统管理员不允许删除' : '删除'}>
                  <Popconfirm
                    title="确认删除这个用户？"
                    onConfirm={() => remove(record.id)}
                    disabled={record.builtIn}
                  >
                    <Button
                      type="text"
                      danger
                      disabled={record.builtIn}
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
        title={editing ? '编辑用户' : '新建用户'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input />
          </Form.Item>
          {!editing ? (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, min: 8, message: '密码至少 8 位' }]}
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
    </Space>
  )
}
