import {
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
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
  parentId: string | null
  title: string
  path: string
  icon: string | null
  sort: number | string
  visible: boolean
}

function MenusRoute() {
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

  const form = useForm<MenuForm>({
    initialValues: { parentId: null, title: "", path: "", icon: null, sort: 0, visible: true },
    validate: {
      title: isNotEmpty(t("enterMenuName")),
      path: isNotEmpty(t("enterRoutePath")),
    },
  })

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
    form.clearErrors()
    form.setValues(
      menu
        ? {
            parentId: menu.parentId,
            title: menu.title,
            path: menu.path,
            icon: menu.icon,
            sort: menu.sort,
            visible: menu.visible,
          }
        : {
            parentId: null,
            title: "",
            path: "",
            icon: null,
            sort: 0,
            visible: true,
          },
    )
    setOpen(true)
  }

  const submit = form.onSubmit(async (values) => {
    const body = {
      parentId: values.parentId,
      title: values.title,
      titleKey: editing?.titleKey ?? null,
      path: values.path,
      icon: values.icon,
      sort: Number(values.sort),
      visible: values.visible,
    }

    try {
      if (editing) {
        await updateMenu.mutateAsync({ id: editing.id, body })
      } else {
        await createMenu.mutateAsync(body)
      }
      notifications.show({ color: "green", message: t("saveSuccess") })
      setOpen(false)
    } catch (error) {
      showRequestError(error, t("saveFailed"))
    }
  })

  const remove = async (id: string) => {
    try {
      await deleteMenu.mutateAsync(id)
      notifications.show({ color: "green", message: t("deleteSuccess") })
    } catch (error) {
      showRequestError(error, t("deleteFailed"))
    }
  }

  const saving = createMenu.isPending || updateMenu.isPending
  const close = () => {
    if (!saving) setOpen(false)
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("menuManagement")}
        description={t("menusDescription")}
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
              {t("createMenu")}
            </Button>
          </ToolbarSurface>
        }
      />

      <SectionPanel title={t("menuManagement")}>
        <DataTable<Menu>
          loading={menusQuery.isFetching}
          error={menusQuery.error}
          rows={menusQuery.data ?? []}
          columns={[
            { key: "name", header: t("menuName"), cell: (menu) => getMenuTitle(menu, t) },
            {
              key: "path",
              header: t("route"),
              cell: (menu) => <Badge variant="light">{menu.path}</Badge>,
            },
            { key: "icon", header: t("icon"), cell: (menu) => menu.icon || "–" },
            { key: "sort", header: t("sort"), width: 90, cell: (menu) => menu.sort },
            {
              key: "visible",
              header: t("sidebarVisible"),
              width: 120,
              cell: (menu) => (
                <Badge variant="light" color={menu.visible ? "green" : "gray"}>
                  {menu.visible ? t("visible") : t("hidden")}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: t("operation"),
              width: 120,
              cell: (menu) => (
                <Group gap={4} wrap="nowrap">
                  <IconAction
                    label={t("edit")}
                    disabled={!canUpdate}
                    onClick={() => showModal(menu)}
                  >
                    <Pencil size={16} />
                  </IconAction>
                  <IconAction
                    label={t(menu.builtIn ? "builtInMenuDeleteDisabled" : "delete")}
                    confirmation={t("confirmDeleteMenu")}
                    color="red"
                    disabled={menu.builtIn || !canDelete || deleteMenu.isPending}
                    onClick={() => void remove(menu.id)}
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
        title={editing ? t("editMenu") : t("createMenu")}
        opened={open}
        onClose={close}
        closeButtonProps={{ "aria-label": t("close"), disabled: saving }}
      >
        <form onSubmit={submit}>
          <Stack>
            <Select
              label={t("parentMenu")}
              clearable
              clearButtonProps={{ "aria-label": t("clear") }}
              data={(menusQuery.data ?? [])
                .filter((item) => item.id !== editing?.id && !item.parentId)
                .map((item) => ({ label: getMenuTitle(item, t), value: item.id }))}
              {...form.getInputProps("parentId")}
            />
            <TextInput
              label={t("menuName")}
              withAsterisk
              data-autofocus
              {...form.getInputProps("title")}
            />
            <TextInput
              label={t("routePath")}
              placeholder="/system/users"
              withAsterisk
              spellCheck={false}
              {...form.getInputProps("path")}
            />
            <Select
              label={t("icon")}
              clearable
              clearButtonProps={{ "aria-label": t("clear") }}
              data={[
                "ai",
                "analytics",
                "audit",
                "bell",
                "chart",
                "chart3d",
                "dashboard",
                "demo",
                "form",
                "globe",
                "map",
                "menu",
                "monitor",
                "settings",
                "table",
                "team",
                "user",
                "workbench",
              ]}
              {...form.getInputProps("icon")}
            />
            <NumberInput
              label={t("sort")}
              min={0}
              allowDecimal={false}
              {...form.getInputProps("sort")}
            />
            <Switch
              label={t("sidebarVisible")}
              onLabel={t("visible")}
              offLabel={t("hidden")}
              {...form.getInputProps("visible", { type: "checkbox" })}
            />
            <FormActions onCancel={close} loading={saving} />
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
