import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyStoredPassword } from "@/lib/password"
import { isValidUserRole, setAuthCookies } from "@/lib/auth"

type LoginPayload = {
  name?: string
  password?: string
  userType?: string
}

type UserLoginRow = {
  id: number
  name: string
  tipo: string | null
  password: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload

    const name = body.name?.trim()
    const password = body.password?.trim()
    const userType = body.userType?.trim().toLowerCase()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    if (!isValidUserRole(userType)) {
      return NextResponse.json({ error: "User type is required" }, { status: 400 })
    }

    const { rows } = await query<UserLoginRow>(
      `
      SELECT id, name, tipo, password
      FROM users
      WHERE LOWER(name) = LOWER($1)
      ORDER BY id DESC
      LIMIT 1
      `,
      [name],
    )

    const sessionUser = rows[0]
    if (!sessionUser) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 401 },
      )
    }

    const dbRole = sessionUser.tipo?.trim().toLowerCase()
    const normalizedDbRole =
      dbRole === "admin" || dbRole === "player"
        ? dbRole
        : dbRole === "administrador"
          ? "admin"
          : dbRole === "jugador"
            ? "player"
            : null

    if (!normalizedDbRole) {
      return NextResponse.json(
        { error: 'Invalid "tipo" value in users table. Expected "admin" or "player".' },
        { status: 500 },
      )
    }

    if (normalizedDbRole !== userType) {
      return NextResponse.json(
        { error: `This account is registered as ${normalizedDbRole === "admin" ? "Administrator" : "Player"}.` },
        { status: 401 },
      )
    }

    if (!sessionUser.password) {
      return NextResponse.json(
        { error: "This account has no password yet. Please sign up again." },
        { status: 401 },
      )
    }

    const isValidPassword = await verifyStoredPassword(password, sessionUser.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({
      user: { id: sessionUser.id, name: sessionUser.name, role: normalizedDbRole },
    })
    setAuthCookies(response, {
      id: sessionUser.id,
      role: normalizedDbRole,
      name: sessionUser.name,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not login"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
