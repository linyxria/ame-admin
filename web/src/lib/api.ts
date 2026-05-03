import { treaty } from "@elysia/eden"
import type { App } from "../../../api/src/index"
import { API_URL } from "./config"

export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
})
