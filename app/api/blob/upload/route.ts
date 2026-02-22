import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 })
    }

    const extension = file.name.split(".").pop() || "jpg"
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase()
    const filename = `players/${Date.now()}-${safeName || `photo.${extension}`}`

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Blob upload error:", error)
    return NextResponse.json(
      { error: "Could not upload image. Check BLOB_READ_WRITE_TOKEN." },
      { status: 500 },
    )
  }
}
