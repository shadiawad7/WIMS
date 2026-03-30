"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/auth"

type AddVideoUrlFormProps = {
  moduleId: string
  initialRole?: UserRole
  sessionId?: number
  sessionName?: string
}

export function AddVideoUrlForm({
  moduleId,
  initialRole,
  sessionId,
  sessionName,
}: AddVideoUrlFormProps) {
  const router = useRouter()
  const [effectiveRole, setEffectiveRole] = useState<UserRole | null>(initialRole ?? null)
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (effectiveRole) {
      return
    }

    const storedRole = window.localStorage.getItem("playerRole")
    if (storedRole === "admin" || storedRole === "player") {
      setEffectiveRole(storedRole)
    }
  }, [effectiveRole])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      setError("Introduce una URL de video")
      setSuccess("")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const restorePayload = {
        id: sessionId ?? Number(window.localStorage.getItem("playerId")),
        name: sessionName ?? window.localStorage.getItem("playerName") ?? "",
        role: effectiveRole ?? window.localStorage.getItem("playerRole") ?? "",
      }

      if (restorePayload.id && restorePayload.name && restorePayload.role === "admin") {
        await fetch("/api/auth/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restorePayload),
        })
      }

      const response = await fetch(`/api/modules/${moduleId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error || "No se pudo guardar la URL")
        return
      }

      setUrl("")
      setSuccess("Video añadido correctamente")
      router.refresh()
    } catch {
      setError("Error de red al guardar la URL")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (effectiveRole !== "admin") {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="liquid-glass-panel rounded-[24px] p-4 space-y-3">
      <p className="text-sm text-white/80 uppercase tracking-wider">Añadir video por URL</p>
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://vimeo.com/123456789"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
    </form>
  )
}
