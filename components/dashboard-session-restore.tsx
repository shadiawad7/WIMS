"use client"

import { useEffect, useState } from "react"

export function DashboardSessionRestore() {
  const [message, setMessage] = useState("Restoring session...")

  useEffect(() => {
    let isMounted = true

    async function restore() {
      const id = window.localStorage.getItem("playerId")
      const name = window.localStorage.getItem("playerName")
      const role = window.localStorage.getItem("playerRole")

      if (!id || !name || !role) {
        window.location.replace("/login")
        return
      }

      try {
        const response = await fetch("/api/auth/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Number(id),
            name,
            role,
          }),
        })

        if (!response.ok) {
          throw new Error("Could not restore session")
        }

        window.location.replace("/dashboard")
      } catch {
        if (isMounted) {
          setMessage("Session expired. Redirecting to login...")
        }

        window.location.replace("/login")
      }
    }

    void restore()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="liquid-glass-panel max-w-md rounded-[28px] p-8 text-center">
        <p className="text-lg font-medium text-white">{message}</p>
      </div>
    </main>
  )
}
