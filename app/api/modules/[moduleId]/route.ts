import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromCookies, isValidUserRole } from "@/lib/auth"
import { query } from "@/lib/db"
import { getModuleMeta, updateModuleMeta } from "@/lib/module-metadata"

type UpdatePayload = {
  id?: number
  userName?: string
  userRole?: string
  name?: string
  director?: string
  directorVideoUrl?: string
  description?: string
  thumbnail?: string
  completion?: number
  locked?: boolean
  unlockTime?: string
}

type UserRow = {
  id: number
  name: string
  tipo: string | null
}

function normalizeDbRole(value: string | null) {
  const role = value?.trim().toLowerCase()
  if (role === "admin" || role === "player") return role
  if (role === "administrador") return "admin"
  if (role === "jugador") return "player"
  return null
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
  const { moduleId } = await context.params

  try {
    const body = (await request.json()) as UpdatePayload
    let session = getSessionFromCookies(await cookies())

    if (!session) {
      const id = Number(body.id)
      const userName = body.userName?.trim() ?? ""
      const userRole = body.userRole?.trim().toLowerCase()

      if (Number.isInteger(id) && id > 0 && userName && isValidUserRole(userRole)) {
        const { rows } = await query<UserRow>(
          `
          SELECT id, name, tipo
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [id],
        )

        const user = rows[0]
        const dbRole = normalizeDbRole(user?.tipo ?? null)
        if (user && dbRole === userRole && user.name === userName) {
          session = {
            id: user.id,
            name: user.name,
            role: userRole,
          }
        }
      }
    }

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can edit modules" }, { status: 403 })
    }

    const current = await getModuleMeta(moduleId)
    if (!current) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const name = body.name?.trim() || current.name
    const director = body.director?.trim() || current.director
    const directorVideoUrl =
      typeof body.directorVideoUrl === "string"
        ? body.directorVideoUrl.trim()
        : current.directorVideoUrl || ""
    const description = body.description?.trim() || current.description
    const thumbnail = body.thumbnail?.trim() || current.thumbnail
    const completion = Math.max(0, Math.min(100, Number(body.completion ?? current.completion)))
    const locked = typeof body.locked === "boolean" ? body.locked : Boolean(current.locked)
    const unlockTime =
      typeof body.unlockTime === "string" ? body.unlockTime.trim() : (current.unlockTime ?? "")

    if (!name || !director || !description || !thumbnail) {
      return NextResponse.json(
        { error: "Name, director, description and thumbnail are required" },
        { status: 400 },
      )
    }

    const updated = await updateModuleMeta(moduleId, {
      name,
      director,
      directorVideoUrl,
      description,
      thumbnail,
      completion,
      locked,
      unlockTime,
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
