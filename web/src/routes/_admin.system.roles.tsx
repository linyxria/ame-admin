import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  TreeSelect,
} from 'antd'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type Role, systemApi, systemQueryKeys } from '../lib/system-api'

export const Route = createFileRoute('/_admin/system/roles')({
  component: RolesRoute,
})

type RoleForm = {
  name: string
  code: string
  description?: string
  enabled: boolean
  menuIds: string[]
}

function RolesRoute() {
  const [form] = Form.useForm<RoleForm>()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)
  const [open, setOpen] = useState(false)

  const rolesQuery = useQuery({
    queryKey: systemQueryKeys.roles,
    queryFn: systemApi.roles,
  })
  const menusQuery = useQuery({
    queryKey: systemQueryKeys.menus,
    queryFn: systemApi.menus,
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.roles }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.menus }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.myMenus }),
    ])
  }

  const createRole = useMutation({
    mutationFn: systemApi.createRole,
    onSuccess: refresh,
  })
  const updateRole = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof systemApi.updateRole>[1] }) =>
      systemApi.updateRole(id, body),
    onSuccess: refresh,
  })
  const deleteRole = useMutation({
    mutationFn: systemApi.deleteRole,
    onSuccess: refresh,
  })

  const menuTree = (menusQuery.data ?? [])
    .filter(
      (item) =>
        !item.parentId || !(menusQuery.data ?? []).some((parent) => parent.id === item.parentId),
    )
    .map((item) => ({
      title: item.title,
      value: item.id,
      key: item.id,
      children: (menusQuery.data ?? [])
        .filter((child) => child.parentId === item.id)
        .map((child) => ({
          title: child.title,
          value: child.id,
          key: child.id,
        })),
    }))

  const showModal = (role?: Role) => {
    setEditing(role ?? null)
    form.setFieldsValue(
      role
        ? {
            name: role.name,
            code: role.code,
            description: role.description ?? undefined,
            enabled: role.enabled,
            menuIds: role.menuIds,
          }
        : { name: '', code: '', description: '', enabled: true, menuIds: [] },
    )
    setOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    const body = {
      name: values.name,
      code: values.code,
      description: values.description ?? null,
      enabled: values.enabled,
      menuIds: values.menuIds ?? [],
    }

    try {
      if (editing) {
        await updateRole.mutateAsync({ id: editing.id, body })
      } else {
        await createRole.mutateAsync(body)
      }
      message.success('保存成功')
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteRole.mutateAsync(id)
      message.success('删除成功')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">角色管理</h1>
          <p className="ame-page-description text-sm">维护角色基础信息和可访问菜单。</p>
        </div>
        <Space>
          <Button
            icon={<RotateCw size={16} />}
            onClick={() => {
              void refresh()
            }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => showModal()}>
            新建角色
          </Button>
        </Space>
      </div>

      <Table<Role>
        rowKey="id"
        loading={rolesQuery.isLoading || menusQuery.isLoading}
        dataSource={rolesQuery.data ?? []}
        columns={[
          { title: '角色名称', dataIndex: 'name' },
          { title: '标识', dataIndex: 'code', render: (code) => <Tag>{code}</Tag> },
          { title: '说明', dataIndex: 'description', render: (value) => value || '-' },
          {
            title: '状态',
            dataIndex: 'enabled',
            render: (enabled) => (
              <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '停用'}</Tag>
            ),
          },
          { title: '菜单数', dataIndex: 'menuIds', render: (value: string[]) => value.length },
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
                <Tooltip title={record.builtIn ? '内置超级管理员角色不允许删除' : '删除'}>
                  <Popconfirm
                    title="确认删除这个角色？"
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
        title={editing ? '编辑角色' : '新建角色'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ enabled: true, menuIds: [] }}>
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色标识"
            rules={[{ required: true, message: '请输入角色标识' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
          <Form.Item name="menuIds" label="菜单权限">
            <TreeSelect
              treeCheckable
              allowClear
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              treeData={menuTree}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
