import {
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  TreeSelect,
} from "@mantine/core"
import { isNotEmpty, useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel, ToolbarSurface } from "../components/design-system"
import { FormActions } from "../components/form-actions"
import { IconAction } from "../components/icon-action"
import { getMenuTitle } from "../lib/menu-title"
import { showRequestError } from "../lib/request-notification"
import {
  createRoleMutationOptions,
  deleteRoleMutationOptions,
  updateRoleMutationOptions,
} from "../services/system/mutations"
import {
  currentUserMenusQueryKey,
  currentUserPermissionsQueryKey,
  currentUserPermissionsQueryOptions,
  menusQueryKey,
  menusQueryOptions,
  type Role,
  rolesQueryKey,
  rolesQueryOptions,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/roles")({
  component: RolesRoute,
})

type RoleForm = {
  name: string
  code: string
  description: string
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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Role | null>(null)
  const [open, setOpen] = useState(false)

  const rolesQuery = useQuery(rolesQueryOptions())
  const menusQuery = useQuery(menusQueryOptions())
  const permissionsQuery = useQuery(currentUserPermissionsQueryOptions())
  const roleActions =
    permissionsQuery.data?.find((item) => item.path === "/system/roles")?.actions ?? []
  const canCreate = roleActions.includes("create")
  const canUpdate = roleActions.includes("update")
  const canDelete = roleActions.includes("delete")

  const form = useForm<RoleForm>({
    initialValues: {
      name: "",
      code: "",
      description: "",
      enabled: true,
      menuIds: [],
      permissions: [],
    },
    validate: {
      name: isNotEmpty(t("enterRoleName")),
      code: isNotEmpty(t("enterRoleCode")),
    },
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
      queryClient.invalidateQueries({ queryKey: menusQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserMenusQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserPermissionsQueryKey }),
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

  const menus = menusQuery.data ?? []
  const menuById = new Map(menus.map((item) => [item.id, item]))
  const menuTree = menus
    .filter((item) => !item.parentId || !menuById.has(item.parentId))
    .map((item) => ({
      label: getMenuTitle(item, t),
      value: item.id,
      children: menus
        .filter((child) => child.parentId === item.id)
        .map((child) => ({ label: getMenuTitle(child, t), value: child.id })),
    }))

  const showModal = (role?: Role) => {
    setEditing(role ?? null)
    form.clearErrors()
    form.setValues(
      role
        ? {
            name: role.name,
            code: role.code,
            description: role.description ?? "",
            enabled: role.enabled,
            menuIds: role.menuIds,
            permissions: role.permissions,
          }
        : { name: "", code: "", description: "", enabled: true, menuIds: [], permissions: [] },
    )
    setOpen(true)
  }

  const submit = form.onSubmit(async (values) => {
    const body = {
      name: values.name,
      code: values.code,
      description: values.description || null,
      enabled: values.enabled,
      menuIds: values.menuIds,
      permissions: values.menuIds.map((menuId) => ({
        menuId,
        actions: values.permissions.find((permission) => permission.menuId === menuId)?.actions ?? [
          "view",
        ],
      })),
    }

    try {
      if (editing) {
        await updateRole.mutateAsync({ id: editing.id, body })
      } else {
        await createRole.mutateAsync(body)
      }
      notifications.show({ color: "green", message: t("saveSuccess") })
      setOpen(false)
    } catch (error) {
      showRequestError(error, t("saveFailed"))
    }
  })

  const remove = async (id: string) => {
    try {
      await deleteRole.mutateAsync(id)
      notifications.show({ color: "green", message: t("deleteSuccess") })
    } catch (error) {
      showRequestError(error, t("deleteFailed"))
    }
  }

  const saving = createRole.isPending || updateRole.isPending
  const close = () => {
    if (!saving) setOpen(false)
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("roleManagement")}
        description={t("rolesDescription")}
        actions={
          <ToolbarSurface>
            <IconAction label={t("refresh")} onClick={() => void refresh()}>
              <RotateCw size={16} />
            </IconAction>
            <Button
              disabled={!canCreate}
              leftSection={<Plus size={16} />}
              onClick={() => showModal()}
            >
              {t("createRole")}
            </Button>
          </ToolbarSurface>
        }
      />

      <SectionPanel title={t("roleManagement")}>
        <DataTable<Role>
          loading={rolesQuery.isFetching || menusQuery.isPending}
          error={rolesQuery.error ?? menusQuery.error}
          rows={rolesQuery.data ?? []}
          columns={[
            { key: "name", header: t("roleName"), cell: (role) => role.name },
            {
              key: "code",
              header: t("roleCode"),
              cell: (role) => <Badge variant="light">{role.code}</Badge>,
            },
            {
              key: "description",
              header: t("description"),
              cell: (role) => role.description || "–",
            },
            {
              key: "status",
              header: t("status"),
              cell: (role) => (
                <Badge variant="light" color={role.enabled ? "green" : "gray"}>
                  {role.enabled ? t("enabled") : t("disabled")}
                </Badge>
              ),
            },
            { key: "menuTotal", header: t("menuTotal"), cell: (role) => role.menuIds.length },
            {
              key: "actions",
              header: t("operation"),
              width: 120,
              cell: (role) => (
                <Group gap={4} wrap="nowrap">
                  <IconAction
                    label={t("edit")}
                    disabled={!canUpdate}
                    onClick={() => showModal(role)}
                  >
                    <Pencil size={16} />
                  </IconAction>
                  <IconAction
                    label={t(role.builtIn ? "builtInRoleDeleteDisabled" : "delete")}
                    confirmation={t("confirmDeleteRole")}
                    color="red"
                    disabled={role.builtIn || !canDelete || deleteRole.isPending}
                    onClick={() => void remove(role.id)}
                  >
                    <Trash2 size={16} />
                  </IconAction>
                </Group>
              ),
            },
          ]}
        />
      </SectionPanel>

      <Modal
        title={editing ? t("editRole") : t("createRole")}
        opened={open}
        onClose={close}
        closeButtonProps={{ "aria-label": t("close"), disabled: saving }}
      >
        <form onSubmit={submit}>
          <Stack>
            <TextInput
              label={t("roleName")}
              withAsterisk
              data-autofocus
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t("roleCode")}
              withAsterisk
              spellCheck={false}
              {...form.getInputProps("code")}
            />
            <Textarea label={t("description")} rows={3} {...form.getInputProps("description")} />
            <Switch
              label={t("status")}
              onLabel={t("enabled")}
              offLabel={t("disabled")}
              {...form.getInputProps("enabled", { type: "checkbox" })}
            />
            <TreeSelect
              label={t("menuPermission")}
              mode="checkbox"
              searchable
              nothingFoundMessage={t("noData")}
              clearable
              clearButtonProps={{ "aria-label": t("clear") }}
              checkedStrategy="parent"
              data={menuTree}
              value={form.values.menuIds}
              onChange={(ids) => form.setFieldValue("menuIds", ids)}
            />
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium">{t("actionPermission")}</legend>
              <Stack gap="xs">
                {!form.values.menuIds.length && (
                  <Text size="sm" c="dimmed">
                    {t("selectMenuBeforeActions")}
                  </Text>
                )}
                {form.values.menuIds.map((menuId) => {
                  const menu = menuById.get(menuId)
                  const permissions = form.values.permissions
                  const current = permissions.find((permission) => permission.menuId === menuId)

                  return (
                    <Checkbox.Group
                      key={menuId}
                      label={menu ? getMenuTitle(menu, t) : menuId}
                      className="ame-border rounded-md border px-3 py-2"
                      value={current?.actions ?? ["view"]}
                      onChange={(actions) =>
                        form.setFieldValue("permissions", [
                          ...permissions.filter((permission) => permission.menuId !== menuId),
                          { menuId, actions },
                        ])
                      }
                    >
                      <Group gap="sm" mt={4}>
                        {actionOptions.map((action) => (
                          <Checkbox
                            key={action.value}
                            value={action.value}
                            label={t(action.labelKey)}
                          />
                        ))}
                      </Group>
                    </Checkbox.Group>
                  )
                })}
              </Stack>
            </fieldset>
            <FormActions onCancel={close} loading={saving} />
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
