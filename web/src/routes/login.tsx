import { Alert, Button, Card, Checkbox, PasswordInput, Stack, Text, TextInput } from "@mantine/core"
import { hasLength, isEmail, useForm } from "@mantine/form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
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
})

function LoginRoute() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()
  const { t } = useTranslation()
  const [error, setError] = useState<string>()
  const signIn = useMutation(signInEmailMutationOptions())

  const form = useForm({
    initialValues: { email: "", password: "", rememberMe: true },
    validate: {
      email: (value) => (value.trim() ? isEmail(t("enterValidEmail"))(value) : t("enterEmail")),
      password: (value) =>
        value
          ? hasLength({ min: 8 }, t("passwordMinLength", { count: 8 }))(value)
          : t("enterPassword"),
    },
  })

  const submit = form.onSubmit(async (values) => {
    setError(undefined)

    const result = await signIn
      .mutateAsync({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
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
  })

  return (
    <main className="grid min-h-screen place-items-center bg-(image:--ame-login-bg) p-8 max-[760px]:p-5">
      <section className="grid w-full max-w-240 grid-cols-[minmax(0,1fr)_420px] items-center gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-6">
        <div>
          <h1 className="ame-page-title mb-4 text-[46px] leading-[1.05] font-semibold max-[760px]:text-4xl">
            AME Admin
          </h1>
          <p className="ame-page-description max-w-105 text-[17px]">{t("loginDescription")}</p>
        </div>

        <Card
          withBorder
          className="w-full rounded-lg p-[clamp(22px,4vw,28px)] shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
        >
          <Stack gap="lg">
            <div>
              <h2 className="ame-page-title mb-1 text-2xl font-semibold">{t("adminLogin")}</h2>
              <Text size="sm" c="dimmed">
                {t("localDefaultAccount")}
              </Text>
            </div>

            {error ? (
              <Alert color="red" role="alert">
                {error}
              </Alert>
            ) : null}

            <form noValidate onSubmit={submit}>
              <Stack gap="md">
                <TextInput
                  label={t("email")}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  size="md"
                  {...form.getInputProps("email")}
                />
                <PasswordInput
                  label={t("password")}
                  name="password"
                  autoComplete="current-password"
                  size="md"
                  visibilityToggleButtonProps={{ "aria-label": t("togglePasswordVisibility") }}
                  {...form.getInputProps("password")}
                />
                <Checkbox
                  label={t("rememberMe")}
                  {...form.getInputProps("rememberMe", { type: "checkbox" })}
                />
                <Button type="submit" size="md" fullWidth loading={signIn.isPending}>
                  {t("signIn")}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </section>
    </main>
  )
}
