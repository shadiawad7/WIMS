"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import type { UserRole } from "@/lib/auth"

type BackToDashboardButtonProps = {
  sessionId?: number
  sessionName?: string
  sessionRole?: UserRole
}

export function BackToDashboardButton({
  sessionId,
  sessionName,
  sessionRole,
}: BackToDashboardButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = async () => {
    if (typeof window === "undefined" || isNavigating) {
      return
    }

    setIsNavigating(true)

    const restorePayload = {
      id: sessionId ?? Number(window.localStorage.getItem("playerId")),
      name: sessionName ?? window.localStorage.getItem("playerName") ?? "",
      role: sessionRole ?? window.localStorage.getItem("playerRole") ?? "",
    }

    if (restorePayload.id && restorePayload.name && restorePayload.role) {
      try {
        await fetch("/api/auth/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restorePayload),
        })
      } catch {
        // Ignore and navigate anyway. Dashboard has its own fallback behavior.
      }
    }

    window.location.assign("/dashboard")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isNavigating}
      className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 disabled:opacity-70"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back to Dashboard</span>
    </button>
  )
}
