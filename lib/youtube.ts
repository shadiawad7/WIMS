export type YouTubeMetadata = {
  videoId: string
  title: string
  description: string
  coach: string
  thumbnail: string
  durationSeconds: number
  duration: string
  views: number
}

function parseIsoDurationToSeconds(isoDuration: string) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) {
    return 0
  }
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
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

export function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url)
    const fromQuery = parsed.searchParams.get("v")
    if (fromQuery) {
      return fromQuery
    }

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] || ""
    }

    if (parsed.pathname.includes("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || ""
    }
  } catch {
    return ""
  }

  return ""
}

export async function fetchYouTubeMetadata(videoUrl: string): Promise<YouTubeMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY in environment")
  }

  const videoId = extractYouTubeVideoId(videoUrl)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos")
  endpoint.searchParams.set("part", "snippet,contentDetails,statistics")
  endpoint.searchParams.set("id", videoId)
  endpoint.searchParams.set("key", apiKey)

  const response = await fetch(endpoint.toString(), { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`YouTube API error (${response.status})`)
  }

  const payload = (await response.json()) as {
    items?: Array<{
      snippet?: {
        title?: string
        description?: string
        channelTitle?: string
        thumbnails?: {
          maxres?: { url?: string }
          high?: { url?: string }
          medium?: { url?: string }
          default?: { url?: string }
        }
      }
      contentDetails?: {
        duration?: string
      }
      statistics?: {
        viewCount?: string
      }
    }>
  }

  const item = payload.items?.[0]
  if (!item?.snippet) {
    throw new Error("YouTube video not found")
  }

  const durationSeconds = parseIsoDurationToSeconds(item.contentDetails?.duration || "PT0S")
  const thumbnail =
    item.snippet.thumbnails?.maxres?.url ||
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    ""

  return {
    videoId,
    title: item.snippet.title || "Untitled Video",
    description: item.snippet.description || "",
    coach: item.snippet.channelTitle || "YouTube",
    thumbnail,
    durationSeconds,
    duration: formatDuration(durationSeconds),
    views: Number(item.statistics?.viewCount || 0),
  }
}
