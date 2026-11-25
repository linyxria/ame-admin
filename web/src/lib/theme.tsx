import { generateColors } from "@mantine/colors-generator"
import { createTheme, MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { createContext, type ReactNode, useContext, useState } from "react"
import { useTranslation } from "react-i18next"

export type ThemeMode = "light" | "dark"

type ThemeSettings = {
  mode: ThemeMode
  primaryColor: string
  compact: boolean
}

type ThemeContextValue = ThemeSettings & {
  setMode: (mode: ThemeMode) => void
  setPrimaryColor: (color: string) => void
  setCompact: (compact: boolean) => void
}

const defaultTheme: ThemeSettings = {
  mode: "light",
  primaryColor: "#2563eb",
  compact: false,
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readTheme(): ThemeSettings {
  try {
    const saved = JSON.parse(localStorage.getItem("ame-theme") ?? "null")

    return {
      mode: saved?.mode === "dark" ? "dark" : "light",
      primaryColor: /^#[0-9a-f]{6}$/i.test(saved?.primaryColor)
        ? saved.primaryColor
        : defaultTheme.primaryColor,
      compact: saved?.compact === true,
    }
  } catch {
    return defaultTheme
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [settings, setSettings] = useState(readTheme)
  const size = settings.compact ? "xs" : "sm"
  const control = { defaultProps: { size } }
  const theme = createTheme({
    colors: { brand: generateColors(settings.primaryColor) },
    primaryColor: "brand",
    autoContrast: true,
    respectReducedMotion: true,
    defaultRadius: "md",
    fontFamily:
      "Aptos, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    components: {
      ActionIcon: control,
      Button: control,
      MultiSelect: control,
      NativeSelect: control,
      NumberInput: control,
      PasswordInput: control,
      Select: control,
      Switch: control,
      Table: { defaultProps: { horizontalSpacing: size, verticalSpacing: size } },
      TextInput: control,
      Textarea: control,
      TreeSelect: control,
    },
  })

  function update(nextSettings: ThemeSettings) {
    localStorage.setItem("ame-theme", JSON.stringify(nextSettings))
    setSettings(nextSettings)
  }

  return (
    <ThemeContext
      value={{
        ...settings,
        setMode: (mode) => update({ ...settings, mode }),
        setPrimaryColor: (primaryColor) => update({ ...settings, primaryColor }),
        setCompact: (compact) => update({ ...settings, compact }),
      }}
    >
      <MantineProvider theme={theme} forceColorScheme={settings.mode}>
        <ModalsProvider modalProps={{ closeButtonProps: { "aria-label": t("close") } }}>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </ThemeContext>
  )
}

export function useThemeSettings() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useThemeSettings must be used within ThemeProvider")
  }

  return context
}
