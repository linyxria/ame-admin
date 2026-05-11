import { App, ConfigProvider, theme } from "antd"
import { default as enUS } from "antd/locale/en_US"
import { default as zhCN } from "antd/locale/zh_CN"
import dayjs from "dayjs"
import { type ReactNode, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useThemeSettings } from "@/lib/theme"

import "dayjs/locale/zh-cn"

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme

const lightShell = {
  bgLayout: "#f5f7fb",
  bgContainer: "#ffffff",
  bgElevated: "#ffffff",
  bgSoft: "#f8fafc",
  border: "#e5eaf2",
  borderSecondary: "#eef2f7",
  text: "#0f172a",
  textSecondary: "#475569",
  textTertiary: "#64748b",
}

const darkShell = {
  bgLayout: "#020617",
  bgContainer: "#0f172a",
  bgElevated: "#111827",
  bgSoft: "#111827",
  border: "#26354a",
  borderSecondary: "#1e293b",
  text: "#f8fafc",
  textSecondary: "#cbd5e1",
  textTertiary: "#94a3b8",
}

export function AntdProvider({ children }: { children: ReactNode }) {
  const { compact, mode, primaryColor } = useThemeSettings()
  const { i18n } = useTranslation()
  const locale = i18n.language === "zh-CN" ? zhCN : enUS
  const isDarkMode = mode === "dark"
  const shell = isDarkMode ? darkShell : lightShell
  const algorithms = [isDarkMode ? darkAlgorithm : defaultAlgorithm]

  if (compact) {
    algorithms.push(compactAlgorithm)
  }

  useEffect(() => {
    dayjs.locale(i18n.language === "zh-CN" ? "zh-cn" : "en")
  }, [i18n.language])

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: algorithms,
        token: {
          colorPrimary: primaryColor,
          colorBgContainer: shell.bgContainer,
          colorBgElevated: shell.bgElevated,
          borderRadius: 10,
          colorBgLayout: shell.bgLayout,
          colorBorder: shell.border,
          colorBorderSecondary: shell.borderSecondary,
          colorText: shell.text,
          colorTextBase: shell.text,
          colorTextSecondary: shell.textSecondary,
          colorTextTertiary: shell.textTertiary,
          controlHeight: 34,
          controlHeightLG: 40,
          controlHeightSM: 28,
          fontFamily:
            "Aptos, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        components: {
          App: {},
          Breadcrumb: {
            itemColor: shell.textTertiary,
            lastItemColor: shell.textSecondary,
            linkColor: shell.textTertiary,
            linkHoverColor: primaryColor,
            separatorColor: shell.textTertiary,
          },
          Button: {
            borderRadius: 10,
            controlHeight: 34,
            defaultShadow: "none",
            primaryShadow: "none",
            textHoverBg: isDarkMode ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.04)",
          },
          Card: {
            actionsBg: shell.bgContainer,
            bodyPadding: 18,
            bodyPaddingSM: 14,
            headerBg: shell.bgContainer,
            headerFontSize: 14,
            headerHeight: 48,
            headerPadding: 18,
            headerPaddingSM: 14,
          },
          Drawer: {
            paddingLG: 20,
          },
          Form: {
            itemMarginBottom: 18,
          },
          Input: {
            activeShadow: `0 0 0 3px ${isDarkMode ? "rgba(56, 189, 248, 0.16)" : "rgba(18, 99, 241, 0.12)"}`,
            borderRadius: 10,
            hoverBorderColor: primaryColor,
          },
          Layout: {
            bodyBg: shell.bgLayout,
            headerBg: shell.bgContainer,
            headerColor: shell.text,
            headerHeight: 64,
            headerPadding: "0 20px",
            lightSiderBg: shell.bgContainer,
            siderBg: shell.bgContainer,
          },
          Menu: {
            activeBarBorderWidth: 0,
            activeBarWidth: 0,
            itemBg: "transparent",
            itemBorderRadius: 8,
            itemColor: shell.textSecondary,
            itemHeight: 40,
            itemHoverBg: isDarkMode ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.04)",
            itemHoverColor: shell.text,
            itemMarginBlock: 3,
            itemSelectedBg: isDarkMode ? "rgba(56, 189, 248, 0.16)" : "rgba(18, 99, 241, 0.1)",
            itemSelectedColor: primaryColor,
            subMenuItemBg: "transparent",
            subMenuItemBorderRadius: 8,
            subMenuItemSelectedColor: primaryColor,
          },
          Popover: {
            titleMinWidth: 180,
          },
          Tabs: {
            cardBg: shell.bgSoft,
          },
          Tag: {
            borderRadiusSM: 999,
          },
          Table: {
            borderColor: shell.borderSecondary,
            cellFontSize: 13,
            cellPaddingBlock: 10,
            cellPaddingBlockMD: 9,
            cellPaddingBlockSM: 7,
            cellPaddingInline: 12,
            cellPaddingInlineMD: 12,
            cellPaddingInlineSM: 10,
            headerBg: shell.bgSoft,
            headerBorderRadius: 8,
            headerColor: shell.textSecondary,
            headerSplitColor: shell.borderSecondary,
            rowHoverBg: isDarkMode ? "rgba(148, 163, 184, 0.08)" : "rgba(15, 23, 42, 0.03)",
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}
