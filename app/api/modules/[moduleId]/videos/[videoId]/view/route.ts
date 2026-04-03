import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionFromCookies, isValidUserRole } from "@/lib/auth"
import { query } from "@/lib/db"
import { recordVideoView } from "@/lib/module-videos"

type ViewPayload = {
  id?: number
  name?: string
  role?: string
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

export async function POST(
  request: Request,
  context: { params: Promise<{ moduleId: string; videoId: string }> },
) {
  let session = getSessionFromCookies(await cookies())

  if (!session) {
    try {
      const body = (await request.json()) as ViewPayload
      const id = Number(body.id)
      const name = body.name?.trim() ?? ""
      const role = body.role?.trim().toLowerCase()

      if (Number.isInteger(id) && id > 0 && name && isValidUserRole(role)) {
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
        if (user && dbRole === role && user.name === name) {
          session = {
            id: user.id,
            name: user.name,
            role,
          }
        }
      }
    } catch {
      // Ignore malformed bodies and fall through to auth error below.
    }
  }

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { moduleId, videoId } = await context.params

  try {
    const result = await recordVideoView(moduleId, videoId, session.id)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      counted: result.counted,
      views: result.views,
    })
  } catch (error) {
    console.error("Video view POST error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not record video view"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
