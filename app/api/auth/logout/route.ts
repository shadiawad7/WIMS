import { NextResponse } from "next/server"
import { AUTH_NAME_COOKIE, AUTH_ROLE_COOKIE, AUTH_SESSION_COOKIE } from "@/lib/auth"

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url))

  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })
  response.cookies.set(AUTH_ROLE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })
  response.cookies.set(AUTH_NAME_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  })

  return response
}
