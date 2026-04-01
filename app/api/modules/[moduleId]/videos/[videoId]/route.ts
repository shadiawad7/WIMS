import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromCookies } from "@/lib/auth"
import { deleteModuleVideo, updateModuleVideo } from "@/lib/module-videos"
import { extractVimeoVideoId, fetchVimeoMetadata } from "@/lib/vimeo"

type UpdateVideoPayload = {
  title?: string
  coach?: string
  duration?: string
  popularity?: number
  views?: number
  beneficialRatio?: number
  description?: string
  videoUrl?: string
  thumbnail?: string
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  const session = getSessionFromCookies(await cookies())
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only administrators can edit videos" }, { status: 403 })
  }

  const { moduleId, videoId } = await context.params

  try {
    const body = (await request.json()) as UpdateVideoPayload
    const nextUrl = body.videoUrl?.trim()

    const metadata =
      nextUrl && extractVimeoVideoId(nextUrl)
        ? await fetchVimeoMetadata(nextUrl)
        : undefined

    const result = await updateModuleVideo(moduleId, videoId, body, metadata)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ video: result.video })
  } catch (error) {
    console.error("Video PATCH error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not update video"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  const session = getSessionFromCookies(await cookies())
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only administrators can delete videos" }, { status: 403 })
  }

  const { moduleId, videoId } = await context.params

  try {
    const result = await deleteModuleVideo(moduleId, videoId)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Video DELETE error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not delete video"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
