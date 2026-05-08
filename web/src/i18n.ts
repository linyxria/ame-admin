import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { enUS } from "./locales/en-us"
import { zhCN } from "./locales/zh-cn"

export const locales = ["zh-CN", "en-US"] as const
export type Locale = (typeof locales)[number]

const resources = {
  "zh-CN": {
    translation: zhCN,
  },
  "en-US": {
    translation: enUS,
  },
} satisfies Record<Locale, { translation: typeof zhCN }>

const readLocale = (): Locale => {
  const saved = localStorage.getItem("ame-locale")

  return locales.includes(saved as Locale) ? (saved as Locale) : "en-US"
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readLocale(),
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
})

i18n.on("languageChanged", (language) => {
  if (locales.includes(language as Locale)) {
    localStorage.setItem("ame-locale", language)
  }
})

export default i18n
