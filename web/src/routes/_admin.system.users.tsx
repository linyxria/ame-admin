import {
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core"
import { isEmail, isNotEmpty, useForm } from "@mantine/form"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { KeyRound, LogOut, Pencil, Plus, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../components/data-table"
import { PageHeader, SectionPanel, ToolbarSurface } from "../components/design-system"
import { FormActions } from "../components/form-actions"
import { IconAction } from "../components/icon-action"
import { showRequestError } from "../lib/request-notification"
import {
  createUserMutationOptions,
  deleteUserMutationOptions,
  resetUserPasswordMutationOptions,
  revokeUserSessionsMutationOptions,
  updateUserMutationOptions,
} from "../services/system/mutations"
import {
  currentUserMenusQueryKey,
  currentUserPermissionsQueryKey,
  currentUserPermissionsQueryOptions,
  rolesQueryKey,
  rolesQueryOptions,
  type SystemUser,
  settingsQueryOptions,
  usersQueryOptions,
  usersQueryPrefixKey,
} from "../services/system/queries"

export const Route = createFileRoute("/_admin/system/users")({
  component: UsersRoute,
})

type UserForm = {
  name: string
  email: string
  password: string
  roleIds: string[]
}

function UsersRoute() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SystemUser | null>(null)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [resetting, setResetting] = useState<SystemUser | null>(null)
  const listParams = { page, pageSize, keyword }

  const usersQuery = useQuery(usersQueryOptions(listParams))
  const rolesQuery = useQuery(rolesQueryOptions())
  const settingsQuery = useQuery(settingsQueryOptions())
  const permissionsQuery = useQuery(currentUserPermissionsQueryOptions())
  const userActions =
    permissionsQuery.data?.find((item) => item.path === "/system/users")?.actions ?? []
  const canCreate = userActions.includes("create")
  const canUpdate = userActions.includes("update")
  const canDelete = userActions.includes("delete")
  const users = usersQuery.data?.items ?? []
  const passwordMinLength = Number(
    settingsQuery.data?.find((item) => item.key === "passwordMinLength")?.value ?? 8,
  )

  const form = useForm<UserForm>({
    initialValues: { name: "", email: "", password: "", roleIds: [] },
    validate: {
      name: isNotEmpty(t("enterName")),
      email: isEmail(t("enterValidEmail")),
      password: (value) =>
        !editing && value.length < passwordMinLength
          ? t("passwordMinLength", { count: passwordMinLength })
          : null,
    },
  })
  const resetForm = useForm({
    initialValues: { password: "" },
    validate: {
      password: (value) =>
        value.length < passwordMinLength
          ? t("passwordMinLength", { count: passwordMinLength })
          : null,
    },
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: usersQueryPrefixKey }),
      queryClient.invalidateQueries({ queryKey: rolesQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserMenusQueryKey }),
      queryClient.invalidateQueries({ queryKey: currentUserPermissionsQueryKey }),
    ])
  }

  const createUser = useMutation({
    ...createUserMutationOptions(),
    onSuccess: refresh,
  })
  const updateUser = useMutation({
    ...updateUserMutationOptions(),
    onSuccess: refresh,
  })
  const deleteUser = useMutation({
    ...deleteUserMutationOptions(),
    onSuccess: refresh,
  })
  const resetPassword = useMutation({
    ...resetUserPasswordMutationOptions(),
    onSuccess: refresh,
  })
  const revokeSessions = useMutation({
    ...revokeUserSessionsMutationOptions(),
    onSuccess: refresh,
    onError: (error) => showRequestError(error, t("requestFailed")),
  })

  const showModal = (user?: SystemUser) => {
    setEditing(user ?? null)
    form.clearErrors()
    form.setValues(
      user
        ? {
            name: user.name,
            email: user.email,
            password: "",
            roleIds: user.roles.map((role) => role.id),
          }
        : { name: "", email: "", password: "", roleIds: [] },
    )
    setOpen(true)
  }

  const submit = form.onSubmit(async (values) => {
    try {
      if (editing) {
        await updateUser.mutateAsync({
          id: editing.id,
          body: {
            name: values.name,
            email: values.email,
            roleIds: values.roleIds,
          },
        })
      } else {
        await createUser.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          roleIds: values.roleIds,
        })
      }
      notifications.show({ color: "green", message: t("saveSuccess") })
      setOpen(false)
    } catch (error) {
      showRequestError(error, t("saveFailed"))
    }
  })

  const remove = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id)
      notifications.show({ color: "green", message: t("deleteSuccess") })
    } catch (error) {
      showRequestError(error, t("deleteFailed"))
    }
  }

  const saving = createUser.isPending || updateUser.isPending
  const closeUser = () => {
    if (!saving) setOpen(false)
  }
  const closeReset = () => {
    if (!resetPassword.isPending) setResetting(null)
  }

  return (
    <Stack gap="lg">
      <PageHeader
        title={t("userManagement")}
        description={t("usersDescription")}
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
              {t("createUser")}
            </Button>
          </ToolbarSurface>
        }
      />

      <SectionPanel
        title={t("userManagement")}
        actions={
          <TextInput
            type="search"
            aria-label={t("searchNameOrEmail")}
            className="max-w-sm"
            placeholder={t("searchNameOrEmail")}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.currentTarget.value)
              setPage(1)
            }}
          />
        }
      >
        <DataTable<SystemUser>
          loading={usersQuery.isFetching || rolesQuery.isPending}
          error={usersQuery.error ?? rolesQuery.error}
          rows={users}
          pagination={{
            page,
            pageSize,
            total: usersQuery.data?.total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setPage(1)
            },
          }}
          columns={[
            {
              key: "user",
              header: t("user"),
              cell: (record) => (
                <Group gap="xs" wrap="nowrap">
                  <Avatar src={record.image} alt="">
                    {record.name.slice(0, 1)}
                  </Avatar>
                  <span>{record.name}</span>
                </Group>
              ),
            },
            { key: "email", header: t("email"), cell: (record) => record.email },
            {
              key: "roles",
              header: t("role"),
              cell: (record) =>
                record.roles.length ? (
                  <Group gap={4}>
                    {record.roles.map((role) => (
                      <Badge key={role.id} variant="light">
                        {role.name}
                      </Badge>
                    ))}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    {t("unassigned")}
                  </Text>
                ),
            },
            {
              key: "status",
              header: t("status"),
              width: 110,
              cell: (record) => (
                <Switch
                  checked={record.enabled}
                  disabled={record.builtIn || !canUpdate || updateUser.isPending}
                  aria-label={`${record.name} · ${t("status")}`}
                  onLabel={t("enabled")}
                  offLabel={t("disabled")}
                  onChange={(event) =>
                    updateUser.mutate(
                      { id: record.id, body: { enabled: event.currentTarget.checked } },
                      { onError: (error) => showRequestError(error, t("saveFailed")) },
                    )
                  }
                />
              ),
            },
            {
              key: "verified",
              header: t("emailVerified"),
              width: 110,
              cell: (record) => (
                <Badge variant="light" color={record.emailVerified ? "green" : "gray"}>
                  {record.emailVerified ? t("verified") : t("unverified")}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: t("operation"),
              width: 150,
              cell: (record) => (
                <Group gap={4} wrap="nowrap">
                  <IconAction
                    label={t("edit")}
                    disabled={!canUpdate}
                    onClick={() => showModal(record)}
                  >
                    <Pencil size={16} />
                  </IconAction>
                  <IconAction
                    label={t("resetPassword")}
                    disabled={!canUpdate}
                    onClick={() => {
                      resetForm.reset()
                      setResetting(record)
                    }}
                  >
                    <KeyRound size={16} />
                  </IconAction>
                  <IconAction
                    label={t("forceSignOut")}
                    confirmation={t("confirmRevokeSessions")}
                    disabled={!canUpdate || revokeSessions.isPending}
                    onClick={() => revokeSessions.mutate(record.id)}
                  >
                    <LogOut size={16} />
                  </IconAction>
                  <IconAction
                    label={t(record.builtIn ? "builtInAdminDeleteDisabled" : "delete")}
                    confirmation={t("confirmDeleteUser")}
                    color="red"
                    disabled={record.builtIn || !canDelete || deleteUser.isPending}
                    onClick={() => void remove(record.id)}
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
        title={editing ? t("editUser") : t("createUser")}
        opened={open}
        onClose={closeUser}
        closeButtonProps={{ "aria-label": t("close"), disabled: saving }}
      >
        <form noValidate onSubmit={submit}>
          <Stack>
            <TextInput
              label={t("name")}
              data-autofocus
              withAsterisk
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t("email")}
              type="email"
              withAsterisk
              {...form.getInputProps("email")}
            />
            {!editing && (
              <PasswordInput
                label={t("initialPassword")}
                autoComplete="new-password"
                withAsterisk
                visibilityToggleButtonProps={{ "aria-label": t("togglePasswordVisibility") }}
                {...form.getInputProps("password")}
              />
            )}
            <MultiSelect
              label={t("role")}
              data={(rolesQuery.data ?? []).map((role) => ({ label: role.name, value: role.id }))}
              {...form.getInputProps("roleIds")}
            />
            <FormActions onCancel={closeUser} loading={saving} />
          </Stack>
        </form>
      </Modal>
      <Modal
        title={`${t("resetPassword")} · ${resetting?.name ?? ""}`}
        opened={Boolean(resetting)}
        onClose={closeReset}
        closeButtonProps={{ "aria-label": t("close"), disabled: resetPassword.isPending }}
      >
        <form
          onSubmit={resetForm.onSubmit(async ({ password }) => {
            if (!resetting) return
            try {
              await resetPassword.mutateAsync({ id: resetting.id, nextPassword: password })
              notifications.show({ color: "green", message: t("passwordResetSuccess") })
              setResetting(null)
            } catch (error) {
              showRequestError(error, t("resetPasswordFailed"))
            }
          })}
        >
          <Stack>
            <PasswordInput
              label={t("newTemporaryPassword")}
              autoComplete="new-password"
              data-autofocus
              withAsterisk
              visibilityToggleButtonProps={{ "aria-label": t("togglePasswordVisibility") }}
              {...resetForm.getInputProps("password")}
            />
            <FormActions onCancel={closeReset} loading={resetPassword.isPending} />
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
