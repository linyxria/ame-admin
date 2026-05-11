import { Deck } from "@deck.gl/core"
import { LineLayer, ScatterplotLayer } from "@deck.gl/layers"
import { createFileRoute } from "@tanstack/react-router"
import { Card, Space, Tag } from "antd"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { operationRegion, operationRoute, operationSites, operationsCenter } from "../lib/demo-geo"

export const Route = createFileRoute("/_admin/examples/maps/2d")({
  component: Map2dRoute,
})

function Map2dRoute() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const deckRef = useRef<HTMLDivElement | null>(null)
  const [selectedSite, setSelectedSite] = useState(operationSites[0])

  useEffect(() => {
    if (!containerRef.current || !deckRef.current) {
      return
    }

    const initialViewState = {
      longitude: operationsCenter.longitude,
      latitude: operationsCenter.latitude,
      zoom: 6.4,
      pitch: 0,
      bearing: 0,
    }
    const deck = new Deck({
      parent: deckRef.current,
      initialViewState,
      controller: false,
      layers: [
        new LineLayer({
          id: "operation-flow",
          data: operationRoute.slice(0, -1).map((point, index) => ({
            source: point,
            target: operationRoute[index + 1],
          })),
          getSourcePosition: (item) => item.source,
          getTargetPosition: (item) => item.target,
          getColor: [20, 184, 166, 210],
          getWidth: 5,
        }),
        new ScatterplotLayer({
          id: "operation-pulses",
          data: operationSites,
          getPosition: (item) => [item.longitude, item.latitude],
          getRadius: (item) => item.throughput * 90,
          getFillColor: (item) =>
            item.status === "online" ? [37, 99, 235, 90] : [245, 158, 11, 110],
          getLineColor: [255, 255, 255, 220],
          lineWidthMinPixels: 1,
          stroked: true,
          pickable: true,
          onClick: ({ object }) => {
            if (object) {
              setSelectedSite(object)
            }
          },
        }),
      ],
    })
    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      style: "https://demotiles.maplibre.org/style.json",
    })
    const syncDeckView = () => {
      const center = map.getCenter()

      deck.setProps({
        viewState: {
          longitude: center.lng,
          latitude: center.lat,
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
        },
      })
    }

    map.addControl(new maplibregl.NavigationControl(), "top-right")
    map.on("move", syncDeckView)
    map.on("load", () => {
      map.addSource("operations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: operationSites.map((site) => ({
            type: "Feature",
            properties: site,
            geometry: { type: "Point", coordinates: [site.longitude, site.latitude] },
          })),
        },
      })
      map.addSource("operation-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: operationRoute },
        },
      })
      map.addSource("operation-region", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [operationRegion] },
        },
      })
      map.addLayer({
        id: "operation-region-fill",
        type: "fill",
        source: "operation-region",
        paint: { "fill-color": "#2563eb", "fill-opacity": 0.12 },
      })
      map.addLayer({
        id: "operation-route-line",
        type: "line",
        source: "operation-route",
        paint: { "line-color": "#16a34a", "line-width": 3 },
      })
      map.addLayer({
        id: "operation-sites-circle",
        type: "circle",
        source: "operations",
        paint: {
          "circle-color": ["match", ["get", "status"], "online", "#16a34a", "#f59e0b"],
          "circle-radius": 8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      })
    })
    map.on("click", "operation-sites-circle", (event) => {
      const feature = event.features?.[0]

      if (feature?.properties) {
        setSelectedSite(feature.properties as (typeof operationSites)[number])
      }
    })

    return () => {
      map.remove()
      deck.finalize()
    }
  }, [])

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <div>
        <h1 className="ame-page-title mb-1.5 text-3xl font-semibold">{t("map2d")}</h1>
        <p className="ame-page-description text-sm">{t("map2dDescription")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="ame-elevated-card" styles={{ body: { padding: 0 } }}>
          <div className="relative h-155 min-h-96 overflow-hidden rounded-md">
            <div ref={containerRef} className="absolute inset-0" />
            <div ref={deckRef} className="pointer-events-none absolute inset-0" />
          </div>
        </Card>
        <Card className="ame-elevated-card" title={t("siteDetail")}>
          <Space orientation="vertical" className="w-full">
            <div className="text-lg font-semibold">{selectedSite.name}</div>
            <Tag color={selectedSite.status === "online" ? "green" : "gold"}>
              {selectedSite.status}
            </Tag>
            <div className="ame-text-muted">
              {t("throughput")}: {selectedSite.throughput}%
            </div>
            <div className="ame-text-subtle text-sm">
              {selectedSite.longitude.toFixed(4)}, {selectedSite.latitude.toFixed(4)}
            </div>
          </Space>
        </Card>
      </div>
    </Space>
  )
}
