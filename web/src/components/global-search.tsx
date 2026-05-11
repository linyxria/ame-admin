import { Button, Empty, Input, Modal } from "antd"
import { Search } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { NavigationEntry } from "../lib/examples"
import { getMenuTitle } from "../lib/menu-title"

export function GlobalSearch({ menus }: { menus: NavigationEntry[] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const entries = menus.map((menu) => ({
    id: menu.id,
    title: getMenuTitle(menu, t),
    searchableTitle: `${getMenuTitle(menu, t)} ${menu.title}`,
    path: menu.path,
  }))
  const results = entries.filter((entry) => {
    return `${entry.searchableTitle} ${entry.path}`.toLowerCase().includes(keyword.toLowerCase())
  })

  return (
    <>
      <Button
        className="ml-auto"
        type="text"
        icon={<Search size={16} />}
        onClick={() => setOpen(true)}
      >
        <span className="hidden truncate md:inline">{t("search")}</span>
      </Button>
      <Modal
        title={t("globalSearch")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Input
          autoFocus
          prefix={<Search size={16} />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={t("globalSearch")}
        />
        <div className="mt-4 max-h-80 overflow-auto">
          {results.length ? (
            results.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className="ame-hover-surface ame-text-muted block rounded-md px-3 py-2"
              >
                <div className="font-medium">{item.title}</div>
                <div className="ame-text-subtle text-xs">{item.path}</div>
              </a>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Modal>
    </>
  )
}
