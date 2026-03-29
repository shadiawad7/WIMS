export type UserRole = "admin" | "player"

export const AUTH_SESSION_COOKIE = "auth_session"
export const AUTH_ROLE_COOKIE = "auth_role"
export const AUTH_NAME_COOKIE = "auth_name"

export type AuthSession = {
  id: number
  role: UserRole
  name: string
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
