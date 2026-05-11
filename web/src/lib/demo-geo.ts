export const operationsCenter = {
  longitude: 121.4737,
  latitude: 31.2304,
}

export const operationSites = [
  {
    id: "site-hq",
    name: "Shanghai HQ",
    status: "online",
    longitude: 121.4737,
    latitude: 31.2304,
    throughput: 84,
  },
  {
    id: "site-suzhou",
    name: "Suzhou Hub",
    status: "online",
    longitude: 120.5853,
    latitude: 31.2989,
    throughput: 68,
  },
  {
    id: "site-hangzhou",
    name: "Hangzhou Edge",
    status: "watching",
    longitude: 120.1551,
    latitude: 30.2741,
    throughput: 52,
  },
  {
    id: "site-nanjing",
    name: "Nanjing Node",
    status: "online",
    longitude: 118.7969,
    latitude: 32.0603,
    throughput: 61,
  },
]

export const operationRoute = operationSites.map((item) => [item.longitude, item.latitude])

export const operationRegion = [
  [118.3, 29.9],
  [122.0, 30.0],
  [122.1, 32.4],
  [118.2, 32.5],
  [118.3, 29.9],
]
