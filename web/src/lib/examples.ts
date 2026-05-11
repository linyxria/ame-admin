import { ENABLE_EXAMPLES } from "./config"

export type NavigationEntry = {
  id: string
  parentId?: string | null
  title: string
  titleKey?: string | null
  path: string
  icon?: string | null
  sort: number
  visible: boolean
  builtIn?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export const exampleMenus: NavigationEntry[] = ENABLE_EXAMPLES
  ? [
      {
        id: "example_root",
        title: "示例",
        titleKey: "examples",
        path: "/examples",
        icon: "demo",
        sort: 900,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_charts_2d",
        parentId: "example_root",
        title: "2D 图表",
        titleKey: "charts2d",
        path: "/examples/charts/2d",
        icon: "chart",
        sort: 10,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_charts_3d",
        parentId: "example_root",
        title: "3D 图表",
        titleKey: "charts3d",
        path: "/examples/charts/3d",
        icon: "chart3d",
        sort: 20,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_maps_2d",
        parentId: "example_root",
        title: "2D 地图",
        titleKey: "map2d",
        path: "/examples/maps/2d",
        icon: "map",
        sort: 30,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_maps_3d",
        parentId: "example_root",
        title: "3D 地图",
        titleKey: "map3d",
        path: "/examples/maps/3d",
        icon: "globe",
        sort: 40,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_digital_twin",
        parentId: "example_root",
        title: "数字孪生大屏",
        titleKey: "digitalTwin",
        path: "/examples/digital-twin",
        icon: "radar",
        sort: 50,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_table",
        parentId: "example_root",
        title: "表格示例",
        titleKey: "tableDemo",
        path: "/examples/table",
        icon: "table",
        sort: 60,
        visible: true,
        builtIn: true,
      },
      {
        id: "example_form",
        parentId: "example_root",
        title: "表单示例",
        titleKey: "formDemo",
        path: "/examples/form",
        icon: "form",
        sort: 70,
        visible: true,
        builtIn: true,
      },
    ]
  : []

export const examplePaths = exampleMenus.filter((item) => item.parentId).map((item) => item.path)

export function isExamplePath(pathname: string) {
  return examplePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
