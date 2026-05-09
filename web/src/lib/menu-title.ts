import type { TFunction } from "i18next"
import type { Menu } from "../services/system/queries"

export function getMenuTitle(menu: Menu, t: TFunction) {
  return menu.titleKey ? t(menu.titleKey, { defaultValue: menu.title }) : menu.title
}
