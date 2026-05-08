import type { TFunction } from "i18next"
import type { Menu } from "../services/system/queries"

export const getMenuTitle = (menu: Menu, t: TFunction) =>
  menu.titleKey ? t(menu.titleKey, { defaultValue: menu.title }) : menu.title
