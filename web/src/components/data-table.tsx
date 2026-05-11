import { Table, type TableProps } from "antd"

export function DataTable<RecordType extends object = object>({
  className,
  size,
  scroll,
  ...props
}: TableProps<RecordType>) {
  return (
    <Table<RecordType>
      className={`ame-data-table ${className ?? ""}`.trim()}
      size={size ?? "middle"}
      scroll={{ x: "max-content", ...scroll }}
      {...props}
    />
  )
}
