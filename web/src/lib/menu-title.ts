import type { TFunction } from "i18next"
import type { NavigationEntry } from "./examples"

export function getMenuTitle(menu: NavigationEntry, t: TFunction) {
  return menu.titleKey ? t(menu.titleKey, { defaultValue: menu.title }) : menu.title
}
