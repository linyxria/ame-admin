import { Avatar, Badge, Button, Empty, Popover, Tabs } from "antd"
import { Bell } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const seedItems = [
  {
    id: "msg-1",
    type: "message",
    avatar: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=96&h=96&fit=crop",
    title: "郑曦月 的私信",
    description: "审批请求已发送，请查收",
    time: "今天 12:30:01",
  },
  {
    id: "msg-2",
    type: "message",
    avatar: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=96&h=96&fit=crop",
    title: "宁波 的回复",
    description: "此处 bug 已经修复，如有问题请查阅文档或者继续反馈",
    time: "今天 12:30:01",
  },
  {
    id: "notice-1",
    type: "notice",
    title: "版本发布",
    description: "AME Admin 组件库示例已更新",
    time: "今天 10:00:00",
  },
  {
    id: "todo-1",
    type: "todo",
    title: "权限审核",
    description: "有 2 个角色权限变更待确认",
    time: "今天 09:20:00",
  },
]

export function Notifications() {
  const { t } = useTranslation()
  const [items, setItems] = useState(seedItems)
  const unread = items.length

  const content = (
    <div className="w-96 max-w-[calc(100vw-32px)]">
      <div className="px-4">
        <Tabs
          items={[
            {
              key: "message",
              label: `${t("messages")} (${items.filter((item) => item.type === "message").length})`,
            },
            {
              key: "notice",
              label: `${t("notices")} (${items.filter((item) => item.type === "notice").length})`,
            },
            {
              key: "todo",
              label: `${t("todos")} (${items.filter((item) => item.type === "todo").length})`,
            },
          ]}
          tabBarExtraContent={
            <Button type="link" onClick={() => setItems([])}>
              {t("clear")}
            </Button>
          }
          styles={{ header: { marginBottom: 0 } }}
        />
      </div>
      <div className="max-h-96 overflow-auto">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="ame-border flex gap-4 border-b px-5 py-4">
              <Avatar src={item.avatar}>{item.title.slice(0, 1)}</Avatar>
              <div className="min-w-0 flex-1">
                <div className="ame-text font-medium">{item.title}</div>
                <div className="ame-text-muted mt-1">{item.description}</div>
                <div className="ame-text-subtle mt-1 text-sm">{item.time}</div>
              </div>
            </div>
          ))
        ) : (
          <Empty className="py-8" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      <div className="grid grid-cols-2 py-1">
        <Button type="link" onClick={() => setItems([])}>
          {t("markAllRead")}
        </Button>
        <Button type="link">{t("viewMore")}</Button>
      </div>
    </div>
  )

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      content={content}
      styles={{ container: { padding: 0 } }}
    >
      <Button type="text" aria-label={t("notifications")}>
        <Badge count={unread} size="small">
          <Bell size={18} />
        </Badge>
      </Button>
    </Popover>
  )
}
