import { Link } from "@tanstack/react-router"
import { Button, Space } from "antd"
import { ArrowLeft, Home } from "lucide-react"
import type { ReactNode } from "react"

type ErrorStateProps = {
  status: string
  title: ReactNode
  description: ReactNode
  primaryText: ReactNode
  primaryTo: "/dashboard/workbench" | "/login"
  secondaryText: ReactNode
}

export function ErrorState({
  status,
  title,
  description,
  primaryText,
  primaryTo,
  secondaryText,
}: ErrorStateProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <div className="text-8xl font-semibold leading-none text-slate-200 dark:text-slate-800">
          {status}
        </div>
        <h1 className="ame-page-title mt-6 text-3xl font-semibold">{title}</h1>
        <p className="ame-page-description mx-auto mt-3 max-w-lg text-base">{description}</p>
        <Space className="mt-8" wrap>
          <Button type="primary" icon={<Home size={16} />}>
            <Link to={primaryTo}>{primaryText}</Link>
          </Button>
          <Button icon={<ArrowLeft size={16} />} onClick={() => globalThis.history.back()}>
            {secondaryText}
          </Button>
        </Space>
      </div>
    </div>
  )
}
