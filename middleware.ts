import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_ROLE_COOKIE, AUTH_SESSION_COOKIE, isValidUserRole } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const session = request.cookies.get(AUTH_SESSION_COOKIE)?.value
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value

  if (!session || !isValidUserRole(role)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/module/:path*", "/video/:path*"],
}
