import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from "antd"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { signInEmailMutationOptions } from "../services/auth/mutations"
import { sessionQueryKey } from "../services/auth/queries"

interface LoginSearch {
  redirect?: string
}

function redirectTo(redirect: string | undefined) {
  return redirect ?? "/"
}

export const Route = createFileRoute("/login")({
  component: LoginRoute,
  validateSearch: (search): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  // TODO: Redirecting here should reuse the cached session query.
  // beforeLoad: async ({ context, search }) => {
  //   const { data } = await context.queryClient.ensureQueryData(sessionQueryOptions())

  //   if (data) {
  //     throw redirect({
  //       to: redirectTo(search.redirect),
  //       replace: true,
  //     })
  //   }
  // },
})

type AuthFormValues = {
  email: string
  password: string
  rememberMe?: boolean
}

function LoginRoute() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()
  const { t } = useTranslation()
  const [error, setError] = useState<string>()
  const signIn = useMutation(signInEmailMutationOptions())

  const submit = async (values: AuthFormValues) => {
    setError(undefined)

    const result = await signIn
      .mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe ?? true,
      })
      .catch((error: unknown) => {
        setError(error instanceof Error ? error.message : t("loginFailed"))
        return null
      })

    if (!result) {
      return
    }

    if (result.error) {
      setError(result.error.message ?? t("loginFailed"))
      return
    }

    queryClient.removeQueries({ queryKey: sessionQueryKey })
    await navigate({ to: redirectTo(redirect), replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[image:var(--ame-login-bg)] p-8 max-[760px]:p-5">
      <section className="grid w-full max-w-240 grid-cols-[minmax(0,1fr)_420px] items-center gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-6">
        <div>
          <h1 className="ame-page-title mb-4 text-[46px] leading-[1.05] font-semibold max-[760px]:text-4xl">
            AME Admin
          </h1>
          <p className="ame-page-description max-w-105 text-[17px]">{t("loginDescription")}</p>
        </div>

        <Card className="w-full rounded-lg shadow-[0_18px_45px_rgba(15,23,42,0.12)] [&_.ant-card-body]:grid [&_.ant-card-body]:gap-5 [&_.ant-card-body]:p-7 max-[760px]:[&_.ant-card-body]:p-5.5">
          <div>
            <h2 className="ame-page-title mb-1 text-2xl font-semibold">{t("adminLogin")}</h2>
            <Typography.Text type="secondary">{t("localDefaultAccount")}</Typography.Text>
          </div>

          {error ? <Alert type="error" title={error} showIcon /> : null}

          <Form layout="vertical" requiredMark={false} onFinish={submit}>
            <Form.Item
              name="email"
              label={t("email")}
              rules={[
                { required: true, message: t("enterEmail") },
                { type: "email", message: t("enterValidEmail") },
              ]}
            >
              <Input autoComplete="email" placeholder="admin@example.com" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("password")}
              rules={[
                { required: true, message: t("enterPassword") },
                { min: 8, message: t("passwordMinLength", { count: 8 }) },
              ]}
            >
              <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" initialValue>
              <Checkbox>{t("rememberMe")}</Checkbox>
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={signIn.isPending}>
              {t("signIn")}
            </Button>
          </Form>
        </Card>
      </section>
    </main>
  )
}
