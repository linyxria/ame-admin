import type { App } from "@ame-admin/server"
import { treaty } from "@elysia/eden"
import { API_URL } from "./config.ts"

type WireData<T> = T extends Date
  ? string
  : T extends Record<string, unknown> | readonly unknown[]
    ? { [Key in keyof T]: WireData<T[Key]> }
    : T

type DataClient<T> = T extends (...args: infer Args) => infer Result
  ? ((
      ...args: Args
    ) => Result extends Promise<{ data: infer Data }>
      ? Promise<WireData<NonNullable<Data>>>
      : DataClient<Result>) & { [Key in keyof T]: DataClient<T[Key]> }
  : T extends object
    ? { [Key in keyof T]: DataClient<T[Key]> }
    : T

const rawApi = treaty<App>(API_URL, {
  // Streamed model text can contain timestamps that must stay strings.
  parseDate: false,
  throwHttpError: true,
  onResponse: (response) => {
    if (response.status === 401 && globalThis.location.pathname !== "/login") {
      const redirect = `${globalThis.location.pathname}${globalThis.location.search}`
      globalThis.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    if (response.status === 403 && globalThis.location.pathname !== "/forbidden") {
      globalThis.location.assign("/forbidden")
    }
  },
  fetch: {
    credentials: "include",
  },
})

function dataApi<T extends object>(target: T): DataClient<T> {
  return new Proxy(target, {
    get(value, property, receiver) {
      const next = Reflect.get(value, property, receiver)

      return next && (typeof next === "object" || typeof next === "function") ? dataApi(next) : next
    },
    apply(value, thisArg, args) {
      const result = Reflect.apply(value as (...args: unknown[]) => unknown, thisArg, args)

      if (result && typeof result === "object" && "then" in result) {
        return (result as Promise<{ data: unknown }>).then(({ data }) => data)
      }

      return result && (typeof result === "object" || typeof result === "function")
        ? dataApi(result)
        : result
    },
  }) as DataClient<T>
}

export const api = dataApi(rawApi.api)
