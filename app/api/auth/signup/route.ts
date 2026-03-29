import { NextResponse } from "next/server"
import { pool, query } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { isValidUserRole } from "@/lib/auth"

type SignupPayload = {
  userType?: string
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

type ExistingAdminRow = {
  id: number
}

type ExistingUserRow = {
  id: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload

    const userType = body.userType?.trim().toLowerCase()
    const name = body.name?.trim()
    const password = body.password?.trim()
    if (!isValidUserRole(userType)) {
      return NextResponse.json({ error: "User type is required" }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must have at least 6 characters" }, { status: 400 })
    }

    const birthYear = Number.isInteger(body.birthYear) ? body.birthYear : null
    const storedPassword = await hashPassword(password)
    const dbRole = userType

    const existingUser = await query<ExistingUserRow>(
      `
      SELECT id
      FROM users
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
      `,
      [name],
    )
    if (existingUser.rows[0]) {
      return NextResponse.json(
        { error: "This name already exists in users. Use another one or sign in." },
        { status: 409 },
      )
    }

    if (userType === "player") {
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

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        const userInsert = await client.query<{ id: number; name: string }>(
          `
          INSERT INTO users (
            name,
            password,
            tipo
          )
          VALUES ($1, $2, $3)
          RETURNING id, name
          `,
          [name, storedPassword, dbRole],
        )

        const playerInsert = await client.query<SignupRow>(
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
            storedPassword,
            birthYear,
            body.club?.trim() || null,
            body.position?.trim() || null,
            body.nationality?.trim() || null,
            body.photo?.trim() || null,
            body.statement?.trim() || null,
          ],
        )

        await client.query("COMMIT")

        return NextResponse.json(
          {
            user: {
              id: userInsert.rows[0].id,
              name: userInsert.rows[0].name,
              role: userType,
              playerId: playerInsert.rows[0].id,
            },
          },
          { status: 201 },
        )
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    const existingAdmin = await query<ExistingAdminRow>(
      `
      SELECT id
      FROM admins
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
      `,
      [name],
    )
    if (existingAdmin.rows[0]) {
      return NextResponse.json(
        { error: "Administrator name already exists. Use another one or sign in." },
        { status: 409 },
      )
    }

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const userInsert = await client.query<{ id: number; name: string }>(
        `
        INSERT INTO users (
          name,
          password,
          tipo
        )
        VALUES ($1, $2, $3)
        RETURNING id, name
        `,
        [name, storedPassword, dbRole],
      )

      await client.query(
        `
        INSERT INTO admins (
          name,
          password,
          id_user
        )
        VALUES ($1, $2, $3)
        `,
        [name, storedPassword, userInsert.rows[0].id],
      )

      await client.query("COMMIT")

      return NextResponse.json(
        { user: { id: userInsert.rows[0].id, name: userInsert.rows[0].name, role: userType } },
        { status: 201 },
      )
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Signup error:", error)
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not create account"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
