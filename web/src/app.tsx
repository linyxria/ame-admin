import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { queryClient } from "./lib/query-client"
import { ThemeProvider } from "./lib/theme"
import { AntdProvider } from "./providers/antd"
import { router } from "./router"

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AntdProvider>
          <RouterProvider router={router} />
        </AntdProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
