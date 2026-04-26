import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router'
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from 'antd'
import { useState } from 'react'

interface LoginSearch {
  redirect?: string
}

const redirectTo = (redirect: string | undefined) => redirect ?? '/'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
  validateSearch: (search): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  // TODO 这里不确定做重定向合不合适, 先注释掉可以在登录页面少一次 getSession 的调用
  // beforeLoad: async ({ context, search }) => {
  //   const { data } = await context.auth.getSession()

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
  const { auth } = useRouteContext({ from: '/login' })
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const submit = async (values: AuthFormValues) => {
    setSubmitting(true)
    setError(undefined)

    const result = await auth.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe ?? true,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? '登录失败，请检查邮箱和密码')
      return
    }

    await navigate({ to: redirectTo(redirect), replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(22,163,74,0.12),transparent_34%),linear-gradient(315deg,rgba(37,99,235,0.12),transparent_36%),#f5f7fb] p-8 max-[760px]:p-5">
      <section className="grid w-full max-w-240 grid-cols-[minmax(0,1fr)_420px] items-center gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-6">
        <div>
          <h1 className="mb-4 text-[46px] leading-[1.05] font-semibold text-slate-900 max-[760px]:text-4xl">
            AME Admin
          </h1>
          <p className="max-w-105 text-[17px] text-slate-600">
            登录后可以管理 AME 的运营数据、用户和内部工作流。
          </p>
        </div>

        <Card className="w-full rounded-lg shadow-[0_18px_45px_rgba(15,23,42,0.12)] [&_.ant-card-body]:grid [&_.ant-card-body]:gap-5 [&_.ant-card-body]:p-7 max-[760px]:[&_.ant-card-body]:p-5.5">
          <div>
            <h2 className="mb-1 text-2xl font-semibold text-slate-900">管理员登录</h2>
            <Typography.Text type="secondary">
              本地默认账号：admin@example.com / admin123456
            </Typography.Text>
          </div>

          {error ? <Alert type="error" title={error} showIcon /> : null}

          <Form layout="vertical" requiredMark={false} onFinish={submit}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效邮箱' },
              ]}
            >
              <Input autoComplete="email" placeholder="admin@example.com" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>

            <Form.Item name="rememberMe" valuePropName="checked" initialValue>
              <Checkbox>保持登录</Checkbox>
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              登录
            </Button>
          </Form>
        </Card>
      </section>
    </main>
  )
}
