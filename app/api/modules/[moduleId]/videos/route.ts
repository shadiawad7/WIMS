import { NextResponse } from "next/server"
import { addVideoUrlToModule, getModuleMeta, getModuleVideos } from "@/lib/module-videos"
import { extractYouTubeVideoId, fetchYouTubeMetadata } from "@/lib/youtube"

type PostPayload = {
  url?: string
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await context.params
  const module = getModuleMeta(moduleId)

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 })
  }

  try {
    const videos = await getModuleVideos(moduleId)
    return NextResponse.json({ module, videos })
  } catch (error) {
    console.error("Module videos GET error:", error)
    return NextResponse.json({ error: "Could not load module videos" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await context.params

  try {
    const body = (await request.json()) as PostPayload
    const videoUrl = body.url?.trim()

    if (!videoUrl) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(videoUrl)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only http(s) URLs are allowed" }, { status: 400 })
    }

    const youtubeId = extractYouTubeVideoId(videoUrl)
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Only YouTube URLs are supported for official metadata right now" },
        { status: 400 },
      )
    }

    const metadata = await fetchYouTubeMetadata(videoUrl)
    const result = await addVideoUrlToModule(moduleId, videoUrl, metadata)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ video: result.video }, { status: 201 })
  } catch (error) {
    console.error("Module videos POST error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not save video URL"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
