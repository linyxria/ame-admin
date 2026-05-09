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
import { useTranslation } from "react-i18next"
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
  password?: string
  roleIds: string[]
}

function UsersRoute() {
  const [form] = Form.useForm<UserForm>()
  const { message } = App.useApp()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SystemUser | null>(null)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [resetting, setResetting] = useState<SystemUser | null>(null)
  const [password, setPassword] = useState("")
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
      message.success(t("saveSuccess"))
      setOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("saveFailed"))
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id)
      message.success(t("deleteSuccess"))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("deleteFailed"))
    }
  }

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("userManagement")}</h1>
          <p className="ame-page-description text-sm">{t("usersDescription")}</p>
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
            {t("createUser")}
          </Button>
        </Space>
      </div>

      <Table<SystemUser>
        rowKey="id"
        loading={usersQuery.isLoading || rolesQuery.isLoading}
        dataSource={users}
        pagination={{
          current: page,
          pageSize,
          total: usersQuery.data?.total ?? 0,
          showSizeChanger: true,
        }}
        onChange={(pagination) => {
          setPage(pagination.current ?? 1)
          setPageSize(pagination.pageSize ?? 20)
        }}
        title={() => (
          <Input.Search
            allowClear
            className="max-w-sm"
            placeholder={t("searchNameOrEmail")}
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPage(1)
            }}
          />
        )}
        columns={[
          {
            title: t("user"),
            render: (_, record) => (
              <Space>
                <Avatar src={record.image}>{record.name.slice(0, 1)}</Avatar>
                <span>{record.name}</span>
              </Space>
            ),
          },
          { title: t("email"), dataIndex: "email" },
          {
            title: t("role"),
            dataIndex: "roles",
            render: (value: SystemUser["roles"]) =>
              value.length > 0 ? (
                value.map((role) => <Tag key={role.id}>{role.name}</Tag>)
              ) : (
                <span className="ame-text-subtle">{t("unassigned")}</span>
              ),
          },
          {
            title: t("status"),
            dataIndex: "enabled",
            width: 110,
            render: (enabled, record) => (
              <Switch
                size="small"
                checked={enabled}
                disabled={record.builtIn || !canUpdate}
                checkedChildren={t("enabled")}
                unCheckedChildren={t("disabled")}
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
            title: t("emailVerified"),
            dataIndex: "emailVerified",
            width: 110,
            render: (verified) => (
              <Tag color={verified ? "green" : "default"}>
                {verified ? t("verified") : t("unverified")}
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
                <Tooltip title={t("resetPassword")}>
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
                <Tooltip title={t("forceSignOut")}>
                  <Popconfirm
                    title={t("confirmRevokeSessions")}
                    onConfirm={() => revokeSessions.mutate(record.id)}
                    disabled={!canUpdate}
                  >
                    <Button type="text" disabled={!canUpdate} icon={<LogOut size={16} />} />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title={record.builtIn ? t("builtInAdminDeleteDisabled") : t("delete")}>
                  <Popconfirm
                    title={t("confirmDeleteUser")}
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
        title={editing ? t("editUser") : t("createUser")}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t("name")}
            rules={[{ required: true, message: t("enterName") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("email")}
            rules={[{ required: true, type: "email", message: t("enterValidEmail") }]}
          >
            <Input />
          </Form.Item>
          {!editing ? (
            <Form.Item
              name="password"
              label={t("initialPassword")}
              rules={[
                {
                  required: true,
                  min: passwordMinLength,
                  message: t("passwordMinLength", { count: passwordMinLength }),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          ) : null}
          <Form.Item name="roleIds" label={t("role")}>
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
        title={`${t("resetPassword")} · ${resetting?.name ?? ""}`}
        open={Boolean(resetting)}
        okButtonProps={{ loading: resetPassword.isPending }}
        onCancel={() => setResetting(null)}
        onOk={async () => {
          if (!resetting) {
            return
          }
          if (password.length < passwordMinLength) {
            message.error(t("passwordMinLength", { count: passwordMinLength }))
            return
          }
          try {
            await resetPassword.mutateAsync({ id: resetting.id, nextPassword: password })
            message.success(t("passwordResetSuccess"))
            setResetting(null)
          } catch (error) {
            message.error(error instanceof Error ? error.message : t("resetPasswordFailed"))
          }
        }}
      >
        <Input.Password
          value={password}
          minLength={passwordMinLength}
          placeholder={t("newTemporaryPassword")}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Modal>
    </Space>
  )
}
