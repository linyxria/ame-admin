import { Canvas } from "@react-three/fiber"
import { createFileRoute } from "@tanstack/react-router"
import { Card, Space, Tag } from "antd"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_admin/examples/charts/3d")({
  component: Charts3dRoute,
})

const bars = [
  { label: "API", value: 3.2, color: "#2563eb", x: -3 },
  { label: "Web", value: 4.4, color: "#16a34a", x: -1 },
  { label: "Jobs", value: 2.8, color: "#f59e0b", x: 1 },
  { label: "DB", value: 3.8, color: "#7c3aed", x: 3 },
]

const points = [
  [-2.5, 1.2, -1.8],
  [-1.2, 2.4, 1.1],
  [0.2, 1.7, -0.4],
  [1.5, 3.1, 1.8],
  [2.8, 2.2, -1.2],
] as const

function ChartScene({ rotation }: { rotation: number }) {
  return (
    <group rotation={[0.25, rotation, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {bars.map((item) => (
        <mesh key={item.label} position={[item.x, item.value / 2, 0]}>
          <boxGeometry args={[0.7, item.value, 0.7]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
      ))}
      {points.map((point) => (
        <mesh key={point.join(":")} position={point}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      ))}
    </group>
  )
}

function Charts3dRoute() {
  const { t } = useTranslation()
  const [rotation, setRotation] = useState(0)

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("charts3d")}</h1>
        <p className="ame-page-description text-sm">{t("charts3dDescription")}</p>
      </div>
      <Card
        title={t("threeDimensionalBars")}
        extra={
          <Space>
            <button
              type="button"
              className="ame-border rounded-md border px-3 py-1 text-sm"
              onClick={() => setRotation((value) => value - 0.35)}
            >
              {t("rotateLeft")}
            </button>
            <button
              type="button"
              className="ame-border rounded-md border px-3 py-1 text-sm"
              onClick={() => setRotation((value) => value + 0.35)}
            >
              {t("rotateRight")}
            </button>
          </Space>
        }
      >
        <div className="h-[560px] min-h-96 overflow-hidden rounded-md bg-slate-950">
          <Canvas camera={{ position: [5, 5, 8], fov: 45 }}>
            <ChartScene rotation={rotation} />
          </Canvas>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2">
        {bars.map((item) => (
          <Tag key={item.label} color={item.color}>
            {item.label} · {item.value.toFixed(1)}
          </Tag>
        ))}
      </div>
    </Space>
  )
}
