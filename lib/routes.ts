export function normalizeModulePathId(value: string) {
  return value.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-")
}

export function buildModuleHref(moduleId: string) {
  return `/module/${encodeURIComponent(normalizeModulePathId(moduleId))}`
}

export function buildVideoHref(moduleId: string, videoId: string) {
  return `/video/${encodeURIComponent(normalizeModulePathId(moduleId))}/${encodeURIComponent(videoId.trim())}`
}
