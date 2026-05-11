import { Elysia } from "elysia"
import { authMacro } from "@/lib/auth"
import { idParams, okResponse } from "@/lib/model"
import { notificationModels } from "./model"
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./service"

export const notificationRoutes = new Elysia({
  name: "system.notifications",
  prefix: "/notifications",
})
  .use(authMacro)
  .model(notificationModels)
  .get("/", ({ query, user: currentUser }) => listNotifications(query, currentUser), {
    auth: true,
    query: "System.NotificationsQuery",
  })
  .post(
    "/:id/read",
    ({ params, user: currentUser }) => markNotificationRead(params.id, currentUser),
    { auth: true, params: idParams, response: okResponse },
  )
  .post("/read-all", ({ user: currentUser }) => markAllNotificationsRead(currentUser), {
    auth: true,
    response: okResponse,
  })
  .delete("/:id", ({ params, user: currentUser }) => deleteNotification(params.id, currentUser), {
    auth: true,
    params: idParams,
    response: okResponse,
  })
