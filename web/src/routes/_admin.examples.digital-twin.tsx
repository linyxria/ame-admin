import { ScreenFit } from "@layout-kit/react"
import { createFileRoute } from "@tanstack/react-router"
import "cesium/Build/Cesium/Widgets/widgets.css"
import { Activity, AlertTriangle, Layers, RadioTower, ShieldCheck, Zap } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { operationSites, operationsCenter } from "../lib/demo-geo"

export const Route = createFileRoute("/_admin/examples/digital-twin")({
  component: DigitalTwinRoute,
})

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const alerts = [
  { level: "P1", text: "Suzhou Hub east gate crowd density rising", time: "10:42:18" },
  { level: "P2", text: "Hangzhou Edge energy load above baseline", time: "10:39:04" },
  { level: "P3", text: "Nanjing Node drone inspection completed", time: "10:33:27" },
]

function DigitalTwinRoute() {
  const [scale, setScale] = useState(1)
  const updateScale = (event: Event) => {
    setScale((event as CustomEvent<{ scale: number }>).detail.scale)
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="ame-bigscreen-shell min-h-0 flex-1">
        <ScreenFit
          draftWidth={DESIGN_WIDTH}
          draftHeight={DESIGN_HEIGHT}
          fit="contain"
          onScale={updateScale}
        >
          <DigitalTwinCanvas scale={scale} />
        </ScreenFit>
      </div>
    </div>
  )
}

function DigitalTwinCanvas({ scale }: { scale: number }) {
  const cesiumRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!cesiumRef.current) {
      return
    }

    let destroyed = false
    let viewer: import("cesium").Viewer | undefined
    window.CESIUM_BASE_URL = "https://unpkg.com/cesium@1.141.0/Build/Cesium/"

    async function mount() {
      const Cesium = await import("cesium")

      if (destroyed || !cesiumRef.current) {
        return
      }

      viewer = new Cesium.Viewer(cesiumRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        timeline: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
      })
      viewer.scene.globe.depthTestAgainstTerrain = true
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true
      }
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          operationsCenter.longitude,
          operationsCenter.latitude,
          420000,
        ),
        orientation: {
          heading: Cesium.Math.toRadians(34),
          pitch: Cesium.Math.toRadians(-48),
          roll: 0,
        },
        duration: 0,
      })

      for (const site of operationSites) {
        viewer.entities.add({
          name: site.name,
          position: Cesium.Cartesian3.fromDegrees(site.longitude, site.latitude),
          box: {
            dimensions: new Cesium.Cartesian3(18000, 18000, site.throughput * 1200),
            material:
              site.status === "online"
                ? Cesium.Color.CYAN.withAlpha(0.38)
                : Cesium.Color.ORANGE.withAlpha(0.46),
            outline: true,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.72),
          },
          label: {
            text: site.name,
            font: "16px sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -28),
          },
        })
      }
    }

    void mount()

    return () => {
      destroyed = true
      viewer?.destroy()
    }
  }, [])

  return (
    <div className="ame-digital-twin-screen" style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}>
      <div ref={cesiumRef} className="absolute inset-0 bg-slate-950" />
      <div className="ame-twin-vignette" />
      <header className="ame-twin-header">
        <div>
          <div className="text-sm tracking-[0.28em] text-cyan-200/70">AME DIGITAL TWIN</div>
          <h1 className="mt-2 text-5xl font-semibold text-white">智慧园区数字孪生指挥舱</h1>
          <div className="mt-2 text-xs text-cyan-100/55">ScreenFit scale {scale.toFixed(3)}</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right">
          <TwinMetric label="在线资产" value="1,284" />
          <TwinMetric label="今日事件" value="32" />
          <TwinMetric label="能耗效率" value="92.6%" />
        </div>
      </header>
      <aside className="ame-twin-panel left-8 top-36 w-92">
        <PanelTitle icon={<RadioTower size={18} />} title="空间资产" />
        <div className="mt-6 grid gap-4">
          {operationSites.map((site) => (
            <div key={site.id} className="rounded-lg border border-cyan-300/15 bg-cyan-300/8 p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-white">{site.name}</span>
                <span className="text-cyan-200">{site.throughput}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${site.throughput}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <aside className="ame-twin-panel right-8 top-36 w-[392px]">
        <PanelTitle icon={<AlertTriangle size={18} />} title="实时告警" />
        <div className="mt-6 grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.time}
              className="rounded-lg border border-orange-300/20 bg-orange-300/8 p-4"
            >
              <div className="flex items-center justify-between text-sm text-orange-200">
                <span>{alert.level}</span>
                <span>{alert.time}</span>
              </div>
              <div className="mt-2 text-base text-white/90">{alert.text}</div>
            </div>
          ))}
        </div>
      </aside>
      <footer className="ame-twin-panel bottom-8 left-8 right-8 grid grid-cols-4 gap-5">
        <HudCard icon={<ShieldCheck />} label="安全态势" value="Stable" />
        <HudCard icon={<Zap />} label="峰值功率" value="4.8 MW" />
        <HudCard icon={<Activity />} label="巡检任务" value="126" />
        <HudCard icon={<Layers />} label="激活图层" value="9" />
      </footer>
    </div>
  )
}

function TwinMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cyan-200/20 bg-slate-950/55 px-5 py-3">
      <div className="text-xs text-cyan-100/60">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-cyan-100">{value}</div>
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 text-cyan-100">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300/15 text-cyan-200">
        {icon}
      </span>
      <span className="text-xl font-semibold">{title}</span>
    </div>
  )
}

function HudCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-cyan-200/15 bg-slate-950/62 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/12 text-cyan-200">
        {icon}
      </span>
      <div>
        <div className="text-sm text-cyan-100/60">{label}</div>
        <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      </div>
    </div>
  )
}
