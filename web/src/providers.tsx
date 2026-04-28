import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import type { ReactNode } from 'react'
import App from './app.tsx'
import { queryClient } from './lib/query-client'
import { ThemeProvider, useThemeSettings } from './lib/theme'

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme

function AntdProvider({ children }: { children: ReactNode }) {
  const { compact, mode, primaryColor } = useThemeSettings()
  const isDarkMode = mode === 'dark'
  const algorithms = [isDarkMode ? darkAlgorithm : defaultAlgorithm]

  if (compact) {
    algorithms.push(compactAlgorithm)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: algorithms,
        token: {
          colorPrimary: primaryColor,
        },
        components: {
          Layout: {
            headerPadding: '0 16px',
            ...(isDarkMode ? {} : { headerBg: '#fff' }),
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AntdProvider>
          <AntdApp>
            <App />
          </AntdApp>
        </AntdProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
