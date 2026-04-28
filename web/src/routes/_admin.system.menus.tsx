import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import { Pencil, Plus, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type Menu, systemApi, systemQueryKeys } from '../lib/system-api'

export const Route = createFileRoute('/_admin/system/menus')({
  component: MenusRoute,
})

type MenuForm = {
  parentId?: string | null
  title: string
  path: string
  icon?: string | null
  sort: number
  visible: boolean
}

function MenusRoute() {
  const [form] = Form.useForm<MenuForm>()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Menu | null>(null)
  const [open, setOpen] = useState(false)

  const menusQuery = useQuery({
    queryKey: systemQueryKeys.menus,
    queryFn: systemApi.menus,
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.menus }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.roles }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.myMenus }),
    ])
  }

  const createMenu = useMutation({
    mutationFn: systemApi.createMenu,
    onSuccess: refresh,
  })
  const updateMenu = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof systemApi.updateMenu>[1] }) =>
      systemApi.updateMenu(id, body),
    onSuccess: refresh,
  })
  const deleteMenu = useMutation({
    mutationFn: systemApi.deleteMenu,
    onSuccess: refresh,
  })

  const showModal = (menu?: Menu) => {
    setEditing(menu ?? null)
    form.setFieldsValue(
      menu
        ? {
            parentId: menu.parentId,
            title: menu.title,
            path: menu.path,
            icon: menu.icon,
            sort: menu.sort,
            visible: menu.visible,
          }
        : { parentId: null, title: '', path: '', icon: null, sort: 0, visible: true },
    )
    setOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    const body = {
      parentId: values.parentId ?? null,
      title: values.title,
      path: values.path,
      icon: values.icon ?? null,
      sort: values.sort ?? 0,
      visible: values.visible,
    }

    try {
      if (editing) {
        await updateMenu.mutateAsync({ id: editing.id, body })
      } else {
        await createMenu.mutateAsync(body)
      }
      message.success('保存成功')
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteMenu.mutateAsync(id)
      message.success('删除成功')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">菜单管理</h1>
          <p className="ame-page-description text-sm">维护后台导航和角色可授权菜单。</p>
        </div>
        <Space>
          <Button
            icon={<RotateCw size={16} />}
            onClick={() => {
              void refresh()
            }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => showModal()}>
            新建菜单
          </Button>
        </Space>
      </div>

      <Table<Menu>
        rowKey="id"
        loading={menusQuery.isLoading}
        dataSource={menusQuery.data ?? []}
        columns={[
          { title: '菜单名称', dataIndex: 'title' },
          { title: '路由', dataIndex: 'path', render: (path) => <Tag>{path}</Tag> },
          { title: '图标', dataIndex: 'icon', render: (value) => value || '-' },
          { title: '排序', dataIndex: 'sort', width: 90 },
          {
            title: '可见',
            dataIndex: 'visible',
            width: 100,
            render: (visible) => (
              <Tag color={visible ? 'green' : 'default'}>{visible ? '显示' : '隐藏'}</Tag>
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
                <Tooltip title={record.builtIn ? '核心菜单不允许删除' : '删除'}>
                  <Popconfirm
                    title="确认删除这个菜单？"
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
        title={editing ? '编辑菜单' : '新建菜单'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ sort: 0, visible: true }}>
          <Form.Item name="parentId" label="上级菜单">
            <Select
              allowClear
              options={(menusQuery.data ?? [])
                .filter((item) => item.id !== editing?.id && !item.parentId)
                .map((item) => ({ label: item.title, value: item.id }))}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="path"
            label="路由地址"
            rules={[{ required: true, message: '请输入路由地址' }]}
          >
            <Input placeholder="/system/users" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Select
              allowClear
              options={[
                { label: 'dashboard', value: 'dashboard' },
                { label: 'settings', value: 'settings' },
                { label: 'user', value: 'user' },
                { label: 'team', value: 'team' },
                { label: 'menu', value: 'menu' },
              ]}
            />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="visible" label="侧边栏显示" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
