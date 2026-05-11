import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
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
  Tag,
  Tooltip,
} from "antd"
import { Pencil, Plus, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel, ToolbarSurface } from "../components/design-system"
import { getMenuTitle } from "../lib/menu-title"
import {
  createMenuMutationOptions,
  deleteMenuMutationOptions,
  updateMenuMutationOptions,
} from "../services/system/mutations"
import {
  currentUserMenusQueryKey,
  currentUserPermissionsQueryKey,
  currentUserPermissionsQueryOptions,
  type Menu,
  menusQueryKey,
  menusQueryOptions,
  rolesQueryKey,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/menus")({
  component: MenusRoute,
})

type MenuForm = {
  parentId?: string | null
  title: string
  titleKey?: string | null
  path: string
  icon?: string | null
  sort: number
  visible: boolean
}

function MenusRoute() {
  const [form] = Form.useForm<MenuForm>()
  const { message } = App.useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Menu | null>(null)
  const [open, setOpen] = useState(false)

  const menusQuery = useQuery(menusQueryOptions())
  const permissionsQuery = useQuery(currentUserPermissionsQueryOptions())
  const menuActions =
    permissionsQuery.data?.find((item) => item.path === "/system/menus")?.actions ?? []
  const canCreate = menuActions.includes("create")
  const canUpdate = menuActions.includes("update")
  const canDelete = menuActions.includes("delete")

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: menusQueryKey }),
      queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserMenusQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserPermissionsQueryKey }),
    ])
  }

  const createMenu = useMutation({
    ...createMenuMutationOptions(),
    onSuccess: refresh,
  })
  const updateMenu = useMutation({
    ...updateMenuMutationOptions(),
    onSuccess: refresh,
  })
  const deleteMenu = useMutation({
    ...deleteMenuMutationOptions(),
    onSuccess: refresh,
  })

  const showModal = (menu?: Menu) => {
    setEditing(menu ?? null)
    form.setFieldsValue(
      menu
        ? {
            parentId: menu.parentId,
            title: menu.title,
            titleKey: menu.titleKey,
            path: menu.path,
            icon: menu.icon,
            sort: menu.sort,
            visible: menu.visible,
          }
        : {
            parentId: null,
            title: "",
            titleKey: null,
            path: "",
            icon: null,
            sort: 0,
            visible: true,
          },
    )
    setOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    const body = {
      parentId: values.parentId ?? null,
      title: values.title,
      titleKey: values.titleKey ?? null,
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
      message.success(t("saveSuccess"))
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("saveFailed"))
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteMenu.mutateAsync(id)
      message.success(t("deleteSuccess"))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("deleteFailed"))
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <PageHeader
        title={t("menuManagement")}
        description={t("menusDescription")}
        actions={
          <ToolbarSurface>
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
              {t("createMenu")}
            </Button>
          </ToolbarSurface>
        }
      />

      <SectionPanel title={t("menuManagement")}>
        <DataTable<Menu>
          rowKey="id"
          loading={menusQuery.isLoading}
          dataSource={menusQuery.data ?? []}
          columns={[
            { title: t("menuName"), render: (_, record) => getMenuTitle(record, t) },
            { title: t("route"), dataIndex: "path", render: (path) => <Tag>{path}</Tag> },
            { title: t("icon"), dataIndex: "icon", render: (value) => value || "-" },
            { title: t("sort"), dataIndex: "sort", width: 90 },
            {
              title: t("sidebarVisible"),
              dataIndex: "visible",
              width: 100,
              render: (visible) => (
                <Tag color={visible ? "green" : "default"}>
                  {visible ? t("visible") : t("hidden")}
                </Tag>
              ),
            },
            {
              title: t("operation"),
              width: 150,
              render: (_, record) => (
                <Space>
                  <Tooltip title={t("edit")}>
                    <Button
                      type="text"
                      disabled={!canUpdate}
                      icon={<Pencil size={16} />}
                      onClick={() => showModal(record)}
                    />
                  </Tooltip>
                  <Tooltip title={record.builtIn ? t("builtInMenuDeleteDisabled") : t("delete")}>
                    <Popconfirm
                      title={t("confirmDeleteMenu")}
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
      </SectionPanel>

      <Modal
        title={editing ? t("editMenu") : t("createMenu")}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ sort: 0, visible: true }}>
          <Form.Item name="parentId" label={t("parentMenu")}>
            <Select
              allowClear
              options={(menusQuery.data ?? [])
                .filter((item) => item.id !== editing?.id && !item.parentId)
                .map((item) => ({ label: getMenuTitle(item, t), value: item.id }))}
            />
          </Form.Item>
          <Form.Item name="titleKey" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label={t("menuName")}
            rules={[{ required: true, message: t("enterMenuName") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="path"
            label={t("routePath")}
            rules={[{ required: true, message: t("enterRoutePath") }]}
          >
            <Input placeholder="/system/users" />
          </Form.Item>
          <Form.Item name="icon" label={t("icon")}>
            <Select
              allowClear
              options={[
                { label: "ai", value: "ai" },
                { label: "analytics", value: "analytics" },
                { label: "audit", value: "audit" },
                { label: "bell", value: "bell" },
                { label: "chart", value: "chart" },
                { label: "chart3d", value: "chart3d" },
                { label: "dashboard", value: "dashboard" },
                { label: "demo", value: "demo" },
                { label: "form", value: "form" },
                { label: "globe", value: "globe" },
                { label: "map", value: "map" },
                { label: "menu", value: "menu" },
                { label: "monitor", value: "monitor" },
                { label: "settings", value: "settings" },
                { label: "table", value: "table" },
                { label: "team", value: "team" },
                { label: "user", value: "user" },
                { label: "workbench", value: "workbench" },
              ]}
            />
          </Form.Item>
          <Form.Item name="sort" label={t("sort")}>
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="visible" label={t("sidebarVisible")} valuePropName="checked">
            <Switch checkedChildren={t("visible")} unCheckedChildren={t("hidden")} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
