import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyPassword } from "@/lib/password"

type LoginPayload = {
  name?: string
  password?: string
}

type LoginRow = {
  id: number
  name: string
  password_hash: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload

    const name = body.name?.trim()
    const password = body.password?.trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const { rows } = await query<LoginRow>(
      `
      SELECT id, name, password_hash
      FROM players
      WHERE LOWER(name) = LOWER($1)
      ORDER BY id DESC
      LIMIT 1
      `,
      [name],
    )

    if (!rows[0]) {
      return NextResponse.json(
        { error: "Player not found. Please sign up first." },
        { status: 401 },
      )
    }
    if (!rows[0].password_hash) {
      return NextResponse.json(
        { error: "This player has no password yet. Please sign up again." },
        { status: 401 },
      )
    }

    const isValidPassword = await verifyPassword(password, rows[0].password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({ player: { id: rows[0].id, name: rows[0].name } })
    response.cookies.set("player_session", String(rows[0].id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "42703"
    ) {
      return NextResponse.json(
        { error: 'Missing column "password_hash" in players table. Run DB migration first.' },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Could not login" }, { status: 500 })
  }
}
