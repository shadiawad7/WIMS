export type UserRole = "admin" | "player"

export const AUTH_SESSION_COOKIE = "auth_session"
export const AUTH_ROLE_COOKIE = "auth_role"
export const AUTH_NAME_COOKIE = "auth_name"

export type AuthSession = {
  id: number
  role: UserRole
  name: string
}

type AuthCookieOptions = {
  expires?: Date
}

type AuthCookieResponse = {
  cookies: {
    set: (
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean
        sameSite?: "lax" | "strict" | "none"
        secure?: boolean
        path?: string
        maxAge?: number
        expires?: Date
      },
    ) => void
  }
}

export function isValidUserRole(value: string | undefined | null): value is UserRole {
  return value === "admin" || value === "player"
}

type CookieStore = {
  get(name: string): { value: string } | undefined
}

export function getSessionFromCookies(cookieStore: CookieStore): AuthSession | null {
  const sessionRaw = cookieStore.get(AUTH_SESSION_COOKIE)?.value
  const roleRaw = cookieStore.get(AUTH_ROLE_COOKIE)?.value
  const name = cookieStore.get(AUTH_NAME_COOKIE)?.value ?? ""

  const id = Number(sessionRaw)
  if (!Number.isInteger(id) || id <= 0 || !isValidUserRole(roleRaw)) {
    return null
  }

  return {
    id,
    role: roleRaw,
    name,
  }
}

export function setAuthCookies(
  response: AuthCookieResponse,
  session: AuthSession,
  options?: AuthCookieOptions,
) {
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }

  const timedOptions = options?.expires
    ? { expires: options.expires }
    : { maxAge: 60 * 60 * 24 * 7 }

  response.cookies.set(AUTH_SESSION_COOKIE, String(session.id), {
    ...baseOptions,
    ...timedOptions,
  })
  response.cookies.set(AUTH_ROLE_COOKIE, session.role, {
    ...baseOptions,
    ...timedOptions,
  })
  response.cookies.set(AUTH_NAME_COOKIE, session.name, {
    ...baseOptions,
    ...timedOptions,
  })
}
