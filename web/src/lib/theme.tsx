import { createContext, type ReactNode, useContext, useLayoutEffect, useState } from "react"

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
  const saved = localStorage.getItem("ame-theme")

  if (!saved) {
    return defaultTheme
  }

  try {
    return { ...defaultTheme, ...JSON.parse(saved) }
  } catch {
    return defaultTheme
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(readTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.mode
  }, [settings.mode])

  const update = (nextSettings: ThemeSettings) => {
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
      {children}
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
