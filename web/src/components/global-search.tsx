import { Button, Empty, Input, Modal } from "antd"
import { Search } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { getMenuTitle } from "../lib/menu-title"
import type { Menu } from "../lib/system-api"

export function GlobalSearch({ menus }: { menus: Menu[] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const results = menus.filter((menu) => {
    const title = getMenuTitle(menu, t)
    return `${title} ${menu.title} ${menu.path}`.toLowerCase().includes(keyword.toLowerCase())
  })

  return (
    <>
      <Button type="text" icon={<Search size={18} />} onClick={() => setOpen(true)}>
        <span className="hidden md:inline">{t("search")}</span>
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
                <div className="font-medium">{getMenuTitle(item, t)}</div>
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
