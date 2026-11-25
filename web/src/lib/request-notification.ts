import { EdenFetchError } from "@elysia/eden"
import { notifications } from "@mantine/notifications"

export function getRequestErrorMessage(error: unknown, fallback: string) {
  if (error instanceof EdenFetchError) {
    const body: unknown = error.value
    return body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export function showRequestError(error: unknown, fallback: string) {
  notifications.show({ color: "red", message: getRequestErrorMessage(error, fallback) })
}
