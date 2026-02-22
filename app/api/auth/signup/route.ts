import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/password"

type SignupPayload = {
  name?: string
  password?: string
  birthYear?: number | null
  club?: string
  position?: string
  nationality?: string
  photo?: string
  statement?: string
}

type SignupRow = {
  id: number
  name: string
  birth_year: number | null
}

type ExistingPlayerRow = {
  id: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload

    const name = body.name?.trim()
    const password = body.password?.trim()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must have at least 6 characters" }, { status: 400 })
    }

    const birthYear = Number.isInteger(body.birthYear) ? body.birthYear : null
    const passwordHash = await hashPassword(password)

    const existingPlayer = await query<ExistingPlayerRow>(
      `
      SELECT id
      FROM players
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
      `,
      [name],
    )
    if (existingPlayer.rows[0]) {
      return NextResponse.json(
        { error: "Player name already exists. Use another one or sign in." },
        { status: 409 },
      )
    }

    const { rows } = await query<SignupRow>(
      `
      INSERT INTO players (
        name,
        password_hash,
        birth_year,
        club,
        position,
        nationality,
        highlights,
        photo,
        statement,
        "continue",
        watching,
        community,
        your_posts,
        favorites
      )
      VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, 0, 0, 0, 0, 0)
      RETURNING id, name, birth_year
      `,
      [
        name,
        passwordHash,
        birthYear,
        body.club?.trim() || null,
        body.position?.trim() || null,
        body.nationality?.trim() || null,
        body.photo?.trim() || null,
        body.statement?.trim() || null,
      ],
    )

    return NextResponse.json({ player: rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
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
    return NextResponse.json({ error: "Could not create player" }, { status: 500 })
  }
}
