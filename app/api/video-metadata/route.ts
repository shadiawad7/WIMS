import { NextResponse } from "next/server"
import { extractVimeoVideoId, fetchVimeoMetadata } from "@/lib/vimeo"

type MetadataPayload = {
  url?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MetadataPayload
    const url = body.url?.trim()

    if (!url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
    }

    if (!extractVimeoVideoId(url)) {
      return NextResponse.json({ error: "Only Vimeo URLs are supported" }, { status: 400 })
    }

    const metadata = await fetchVimeoMetadata(url)
    return NextResponse.json({ metadata })
  } catch (error) {
    console.error("Video metadata error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not fetch video metadata"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
