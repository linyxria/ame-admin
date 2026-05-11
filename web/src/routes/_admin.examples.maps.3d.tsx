import { createFileRoute } from "@tanstack/react-router"
import { Card, Space, Tag } from "antd"
import "cesium/Build/Cesium/Widgets/widgets.css"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { operationSites, operationsCenter } from "../lib/demo-geo"

export const Route = createFileRoute("/_admin/examples/maps/3d")({
  component: Map3dRoute,
})

declare global {
  interface Window {
    CESIUM_BASE_URL?: string
  }
}

function Map3dRoute() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    let destroyed = false
    let viewer: import("cesium").Viewer | undefined
    window.CESIUM_BASE_URL = "https://unpkg.com/cesium@1.141.0/Build/Cesium/"

    async function mount() {
      const Cesium = await import("cesium")

      if (destroyed || !containerRef.current) {
        return
      }

      viewer = new Cesium.Viewer(containerRef.current, {
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
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          operationsCenter.longitude,
          operationsCenter.latitude,
          580000,
        ),
        orientation: {
          heading: Cesium.Math.toRadians(18),
          pitch: Cesium.Math.toRadians(-54),
          roll: 0,
        },
        duration: 0,
      })

      for (const site of operationSites) {
        viewer.entities.add({
          name: site.name,
          position: Cesium.Cartesian3.fromDegrees(site.longitude, site.latitude),
          point: {
            pixelSize: 12,
            color: site.status === "online" ? Cesium.Color.CYAN : Cesium.Color.ORANGE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          cylinder: {
            length: site.throughput * 900,
            topRadius: 11000,
            bottomRadius: 11000,
            material:
              site.status === "online"
                ? Cesium.Color.CYAN.withAlpha(0.42)
                : Cesium.Color.ORANGE.withAlpha(0.45),
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
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("map3d")}</h1>
        <p className="ame-page-description text-sm">{t("map3dDescription")}</p>
      </div>
      <Card className="ame-elevated-card" styles={{ body: { padding: 0 } }}>
        <div
          ref={containerRef}
          className="h-160 min-h-96 overflow-hidden rounded-md bg-slate-950"
        />
      </Card>
      <div className="flex flex-wrap gap-2">
        {operationSites.map((site) => (
          <Tag key={site.id} color={site.status === "online" ? "cyan" : "gold"}>
            {site.name} · {site.throughput}%
          </Tag>
        ))}
      </div>
    </Space>
  )
}
