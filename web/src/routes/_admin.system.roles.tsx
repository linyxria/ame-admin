import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  App,
  Button,
  Checkbox,
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
} from "antd"
import { Pencil, Plus, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { getMenuTitle } from "../lib/menu-title"
import {
  createRoleMutationOptions,
  deleteRoleMutationOptions,
  updateRoleMutationOptions,
} from "../services/system/mutations"
import {
  menusQueryOptions,
  myPermissionsQueryOptions,
  type Role,
  rolesQueryOptions,
  systemQueryKeys,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/roles")({
  component: RolesRoute,
})

type RoleForm = {
  name: string
  code: string
  description?: string
  enabled: boolean
  menuIds: string[]
  permissions: { menuId: string; actions: string[] }[]
}

const actionOptions = [
  { labelKey: "view", value: "view" },
  { labelKey: "create", value: "create" },
  { labelKey: "update", value: "update" },
  { labelKey: "delete", value: "delete" },
]

function RolesRoute() {
  const [form] = Form.useForm<RoleForm>()
  const { message } = App.useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)
  const [open, setOpen] = useState(false)
  const selectedMenuIds = Form.useWatch("menuIds", form) ?? []

  const rolesQuery = useQuery(rolesQueryOptions())
  const menusQuery = useQuery(menusQueryOptions())
  const permissionsQuery = useQuery(myPermissionsQueryOptions())
  const roleActions =
    permissionsQuery.data?.find((item) => item.path === "/system/roles")?.actions ?? []
  const canCreate = roleActions.includes("create")
  const canUpdate = roleActions.includes("update")
  const canDelete = roleActions.includes("delete")

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.roles }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.menus }),
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.myMenus }),
    ])
  }

  const createRole = useMutation({
    ...createRoleMutationOptions(),
    onSuccess: refresh,
  })
  const updateRole = useMutation({
    ...updateRoleMutationOptions(),
    onSuccess: refresh,
  })
  const deleteRole = useMutation({
    ...deleteRoleMutationOptions(),
    onSuccess: refresh,
  })

  const menuTree = (menusQuery.data ?? [])
    .filter(
      (item) =>
        !item.parentId || !(menusQuery.data ?? []).some((parent) => parent.id === item.parentId),
    )
    .map((item) => ({
      title: getMenuTitle(item, t),
      value: item.id,
      key: item.id,
      children: (menusQuery.data ?? [])
        .filter((child) => child.parentId === item.id)
        .map((child) => ({
          title: getMenuTitle(child, t),
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
            permissions: role.permissions,
          }
        : { name: "", code: "", description: "", enabled: true, menuIds: [], permissions: [] },
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
      permissions: (values.menuIds ?? []).map((menuId) => ({
        menuId,
        actions: values.permissions?.find((permission) => permission.menuId === menuId)
          ?.actions ?? ["view"],
      })),
    }

    try {
      if (editing) {
        await updateRole.mutateAsync({ id: editing.id, body })
      } else {
        await createRole.mutateAsync(body)
      }
      message.success(t("saveSuccess"))
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("saveFailed"))
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteRole.mutateAsync(id)
      message.success(t("deleteSuccess"))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("deleteFailed"))
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("roleManagement")}</h1>
          <p className="ame-page-description text-sm">{t("rolesDescription")}</p>
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
            {t("createRole")}
          </Button>
        </Space>
      </div>

      <Table<Role>
        rowKey="id"
        loading={rolesQuery.isLoading || menusQuery.isLoading}
        dataSource={rolesQuery.data ?? []}
        columns={[
          { title: t("roleName"), dataIndex: "name" },
          { title: t("roleCode"), dataIndex: "code", render: (code) => <Tag>{code}</Tag> },
          { title: t("description"), dataIndex: "description", render: (value) => value || "-" },
          {
            title: t("status"),
            dataIndex: "enabled",
            render: (enabled) => (
              <Tag color={enabled ? "green" : "default"}>
                {enabled ? t("enabled") : t("disabled")}
              </Tag>
            ),
          },
          {
            title: t("menuTotal"),
            dataIndex: "menuIds",
            render: (value: string[]) => value.length,
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
                <Tooltip title={record.builtIn ? t("builtInRoleDeleteDisabled") : t("delete")}>
                  <Popconfirm
                    title={t("confirmDeleteRole")}
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
        title={editing ? t("editRole") : t("createRole")}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ enabled: true, menuIds: [], permissions: [] }}
        >
          <Form.Item
            name="name"
            label={t("roleName")}
            rules={[{ required: true, message: t("enterRoleName") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={t("roleCode")}
            rules={[{ required: true, message: t("enterRoleCode") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t("description")}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label={t("status")} valuePropName="checked">
            <Switch checkedChildren={t("enabled")} unCheckedChildren={t("disabled")} />
          </Form.Item>
          <Form.Item name="menuIds" label={t("menuPermission")}>
            <TreeSelect
              treeCheckable
              allowClear
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              treeData={menuTree}
            />
          </Form.Item>
          <Form.Item label={t("actionPermission")} shouldUpdate>
            {() => (
              <Space orientation="vertical" className="w-full">
                {selectedMenuIds.length ? (
                  selectedMenuIds.map((menuId) => {
                    const menu = menusQuery.data?.find((item) => item.id === menuId)
                    const permissions = form.getFieldValue("permissions") ?? []
                    const current = permissions.find(
                      (permission: RoleForm["permissions"][number]) => permission.menuId === menuId,
                    )

                    return (
                      <div
                        key={menuId}
                        className="ame-border flex items-center justify-between gap-4 rounded-md border px-3 py-2"
                      >
                        <span className="ame-text min-w-32">
                          {menu ? getMenuTitle(menu, t) : menuId}
                        </span>
                        <Checkbox.Group
                          options={actionOptions.map((item) => ({
                            label: t(item.labelKey),
                            value: item.value,
                          }))}
                          value={current?.actions ?? ["view"]}
                          onChange={(actions) => {
                            const next = permissions.filter(
                              (permission: RoleForm["permissions"][number]) =>
                                permission.menuId !== menuId,
                            )
                            form.setFieldValue("permissions", [
                              ...next,
                              { menuId, actions: actions.map(String) },
                            ])
                          }}
                        />
                      </div>
                    )
                  })
                ) : (
                  <span className="ame-text-subtle">{t("selectMenuBeforeActions")}</span>
                )}
              </Space>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
