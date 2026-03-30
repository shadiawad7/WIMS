import { NextResponse } from "next/server"
import { isValidUserRole, setAuthCookies } from "@/lib/auth"
import { query } from "@/lib/db"

type RestorePayload = {
  id?: number
  name?: string
  role?: string
}

type UserRestoreRow = {
  id: number
  name: string
  tipo: string | null
}

function normalizeDbRole(value: string | null) {
  const role = value?.trim().toLowerCase()

  if (role === "admin" || role === "player") {
    return role
  }

  if (role === "administrador") {
    return "admin"
  }

  if (role === "jugador") {
    return "player"
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RestorePayload
    const id = Number(body.id)
    const name = body.name?.trim() ?? ""
    const role = body.role?.trim().toLowerCase()

    if (!Number.isInteger(id) || id <= 0 || !name || !isValidUserRole(role)) {
      return NextResponse.json({ error: "Invalid restore payload" }, { status: 400 })
    }

    const { rows } = await query<UserRestoreRow>(
      `
      SELECT id, name, tipo
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    )

    const user = rows[0]
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const dbRole = normalizeDbRole(user.tipo)
    if (!dbRole || dbRole !== role || user.name !== name) {
      return NextResponse.json({ error: "Session mismatch" }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    setAuthCookies(response, {
      id: user.id,
      role,
      name: user.name,
    })

    return response
  } catch (error) {
    console.error("Restore auth error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not restore session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
