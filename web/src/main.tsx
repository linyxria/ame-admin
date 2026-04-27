import { QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { queryClient } from './lib/query-client'

const { defaultAlgorithm } = theme
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb',
          colorBgBase: '#ffffff',
          colorTextBase: '#111827',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#ffffff',
            bodyBg: '#f1f5f9',
            headerHeight: 64,
            headerPadding: '0 24px',
          },
          Menu: {
            itemBg: '#ffffff',
            itemSelectedBg: '#eff6ff',
            itemSelectedColor: '#2563eb',
            itemHoverBg: '#f8fafc',
            itemHoverColor: '#1d4ed8',
            darkItemBg: '#ffffff',
            darkItemSelectedBg: '#eff6ff',
          },
          Card: {
            borderRadiusLG: 8,
          },
        },
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
