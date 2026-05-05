import { treaty } from "@elysia/eden"
import type { App } from "../../../api/src"
import { API_URL } from "./config"

export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
})
