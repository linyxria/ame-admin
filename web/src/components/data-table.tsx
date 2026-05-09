import { Table, type TableProps } from "antd"

export function DataTable<RecordType extends object = object>({
  scroll,
  ...props
}: TableProps<RecordType>) {
  return <Table<RecordType> scroll={{ x: "max-content", ...scroll }} {...props} />
}
