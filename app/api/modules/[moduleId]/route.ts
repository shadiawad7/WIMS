import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromCookies } from "@/lib/auth"
import { getModuleMeta, updateModuleMeta } from "@/lib/module-metadata"

type UpdatePayload = {
  name?: string
  director?: string
  description?: string
  thumbnail?: string
  completion?: number
  locked?: boolean
  unlockTime?: string
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await context.params
  const moduleMeta = await getModuleMeta(moduleId)

  if (!moduleMeta) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 })
  }

  return NextResponse.json({ module: moduleMeta })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ moduleId: string }> },
) {
  const session = getSessionFromCookies(await cookies())
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only administrators can edit modules" }, { status: 403 })
  }

  const { moduleId } = await context.params

  try {
    const body = (await request.json()) as UpdatePayload
    const name = body.name?.trim()
    const director = body.director?.trim()
    const description = body.description?.trim()
    const thumbnail = body.thumbnail?.trim()
    const completion = Math.max(0, Math.min(100, Number(body.completion ?? 0)))

    if (!name || !director || !description || !thumbnail) {
      return NextResponse.json(
        { error: "Name, director, description and thumbnail are required" },
        { status: 400 },
      )
    }

    const updated = await updateModuleMeta(moduleId, {
      name,
      director,
      description,
      thumbnail,
      completion,
      locked: Boolean(body.locked),
      unlockTime: body.unlockTime?.trim() || "",
    })

    if (!updated) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json({ module: updated })
  } catch (error) {
    console.error("Module metadata PATCH error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not update module"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
