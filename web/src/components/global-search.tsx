import { Button, Modal, TextInput } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { NavigationEntry } from "../lib/examples"
import { getMenuTitle } from "../lib/menu-title"
import { EmptyState } from "./design-system"

export function GlobalSearch({ menus }: { menus: NavigationEntry[] }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const [keyword, setKeyword] = useState("")
  const parentIds = new Set(menus.map((menu) => menu.parentId))
  const results = menus
    .filter((menu) => menu.visible && !parentIds.has(menu.id))
    .map((menu) => ({ ...menu, label: getMenuTitle(menu, t) }))
    .filter(({ label, title, path }) =>
      `${label} ${title} ${path}`.toLowerCase().includes(keyword.trim().toLowerCase()),
    )

  function close() {
    setOpened(false)
    setKeyword("")
  }

  return (
    <>
      <Button variant="subtle" aria-label={t("search")} px="xs" onClick={() => setOpened(true)}>
        <Search size={16} />
        <span className="ml-2 hidden truncate lg:inline">{t("search")}</span>
      </Button>
      <Modal
        title={t("globalSearch")}
        opened={opened}
        onClose={close}
        closeButtonProps={{ "aria-label": t("close") }}
      >
        <TextInput
          data-autofocus
          type="search"
          aria-label={t("globalSearch")}
          leftSection={<Search size={16} />}
          value={keyword}
          onChange={(event) => setKeyword(event.currentTarget.value)}
          placeholder={t("globalSearch")}
        />
        <div className="mt-4 max-h-80 overflow-auto">
          {results.length ? (
            results.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={close}
                className="ame-hover-surface ame-text-muted block rounded-md px-3 py-2"
              >
                <div className="font-medium">{item.label}</div>
                <div className="ame-text-subtle text-xs">{item.path}</div>
              </Link>
            ))
          ) : (
            <EmptyState description={t("noData")} />
          )}
        </div>
      </Modal>
    </>
  )
}
