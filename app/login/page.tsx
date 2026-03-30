"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"admin" | "player">("player")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          name,
          password,
        }),
      })

      const data = (await response.json()) as {
        error?: string
        user?: { id: number; name: string; role: "admin" | "player" }
      }

      if (!response.ok || !data.user) {
        setError(data.error ?? "Invalid credentials")
        return
      }

      localStorage.setItem("playerId", String(data.user.id))
      localStorage.setItem("playerName", data.user.name)
      localStorage.setItem("playerRole", data.user.role)
      router.push("/dashboard")
    } catch {
      setError("Network error. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(207,56,0,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </Link>

      <div className="absolute top-6 right-6 z-20">
        <Link
          href="https://www.wims.es"
          target="_blank"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Powered by WIMS GROUP
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-12 scale-75">
          <Logo />
        </div>

        <div className="liquid-glass-panel rounded-[28px] p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome Back</h2>
          <p className="text-muted-foreground text-center mb-8">
            Sign in as administrator or player
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType("player")}
                className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                  userType === "player"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/50 text-foreground"
                }`}
              >
                Player
              </button>
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
                  userType === "admin"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/50 text-foreground"
                }`}
              >
                Administrator
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                {userType === "admin" ? "Administrator Name" : "Player Name"}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={userType === "admin" ? "Pau Llacer" : "Nicholas Costa"}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border focus:border-primary h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider"
            >
              {isLoading ? "Signing in..." : `Sign In as ${userType === "admin" ? "Administrator" : "Player"}`}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Not registered yet?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Create profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
