import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { profileModels } from "./model"
import { updateProfile } from "./service"

export const profileRoutes = new Elysia({ name: "system.profile", prefix: "/profile" })
  .use(authMacro)
  .model(profileModels)
  .patch("/", ({ body, user: currentUser }) => updateProfile(body, currentUser), {
    auth: true,
    body: "System.ProfileBody",
  })
