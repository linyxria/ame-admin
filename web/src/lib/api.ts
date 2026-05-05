import type { App } from "@ame-admin/api"
import { treaty } from "@elysia/eden"
import { API_URL } from "./config"

export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
})
