import { mutationOptions } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

export type SignInEmailInput = Parameters<typeof authClient.signIn.email>[0]

export function signInEmailMutationOptions() {
  return mutationOptions({
    mutationFn: (body: SignInEmailInput) => authClient.signIn.email(body),
  })
}

export function signOutMutationOptions() {
  return mutationOptions({
    mutationFn: () => authClient.signOut(),
  })
}
