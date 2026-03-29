export type VimeoMetadata = {
  videoId: string
  title: string
  description: string
  coach: string
  thumbnail: string
  durationSeconds: number
  duration: string
  views: number
}

function formatDuration(secondsTotal: number) {
  const hours = Math.floor(secondsTotal / 3600)
  const minutes = Math.floor((secondsTotal % 3600) / 60)
  const seconds = secondsTotal % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function extractVimeoVideoId(url: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("vimeo.com")) {
      return ""
    }

    const segments = parsed.pathname.split("/").filter(Boolean)
    for (let index = segments.length - 1; index >= 0; index -= 1) {
      if (/^\d+$/.test(segments[index])) {
        return segments[index]
      }
    }
  } catch {
    return ""
  }

  return ""
}

function getCanonicalVimeoUrl(videoId: string) {
  return `https://vimeo.com/${videoId}`
}

export async function fetchVimeoMetadata(videoUrl: string): Promise<VimeoMetadata> {
  const videoId = extractVimeoVideoId(videoUrl)
  if (!videoId) {
    throw new Error("Invalid Vimeo URL")
  }

  const endpoint = new URL("https://vimeo.com/api/oembed.json")
  endpoint.searchParams.set("url", getCanonicalVimeoUrl(videoId))

  const response = await fetch(endpoint.toString(), { cache: "no-store" })
  if (response.ok) {
    const payload = (await response.json()) as {
      title?: string
      author_name?: string
      description?: string
      thumbnail_url?: string
      duration?: number
    }

    return {
      videoId,
      title: payload.title || "Untitled Video",
      description: payload.description || "",
      coach: payload.author_name || "Vimeo",
      thumbnail: payload.thumbnail_url || "",
      durationSeconds: payload.duration || 0,
      duration: formatDuration(payload.duration || 0),
      views: 0,
    }
  }

  const configResponse = await fetch(`https://player.vimeo.com/video/${videoId}/config`, {
    cache: "no-store",
  })
  if (!configResponse.ok) {
    throw new Error(`Vimeo metadata error (${response.status}/${configResponse.status})`)
  }

  const payload = (await configResponse.json()) as {
    video?: {
      title?: string
      duration?: number
      thumbs?: {
        base?: string
        "640"?: string
        "960"?: string
        "1280"?: string
      }
      owner?: {
        name?: string
      }
    }
    request?: {
      text_tracks?: { lang?: string }[]
    }
  }

  const thumbnail =
    payload.video?.thumbs?.["1280"] ||
    payload.video?.thumbs?.["960"] ||
    payload.video?.thumbs?.["640"] ||
    payload.video?.thumbs?.base ||
    ""

  return {
    videoId,
    title: payload.video?.title || "Untitled Video",
    description: "",
    coach: payload.video?.owner?.name || "Vimeo",
    thumbnail,
    durationSeconds: payload.video?.duration || 0,
    duration: formatDuration(payload.video?.duration || 0),
    views: 0,
  }
}
