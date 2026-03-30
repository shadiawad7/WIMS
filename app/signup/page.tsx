"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const features = [
  "Access to all methodology videos",
  "Exclusive coaching content",
  "Community access & clip sharing",
  "Track your learning progress",
]

const footballPositions = [
  "Goalkeeper",
  "Right Back",
  "Left Back",
  "Center Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Midfielder",
  "Left Midfielder",
  "Right Winger",
  "Left Winger",
  "Second Striker",
  "Striker",
]

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"admin" | "player">("player")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [birthYear, setBirthYear] = useState("")
  const [club, setClub] = useState("")
  const [position, setPosition] = useState("")
  const [nationality, setNationality] = useState("")
  const [statement, setStatement] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let photoUrl: string | null = null
      if (photoFile) {
        const uploadBody = new FormData()
        uploadBody.append("file", photoFile)

        const uploadResponse = await fetch("/api/blob/upload", {
          method: "POST",
          body: uploadBody,
        })
        const uploadData = (await uploadResponse.json()) as { error?: string; url?: string }
        if (!uploadResponse.ok || !uploadData.url) {
          setError(uploadData.error ?? "Could not upload photo")
          return
        }
        photoUrl = uploadData.url
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          name,
          password,
          birthYear: birthYear ? Number(birthYear) : null,
          club,
          position,
          nationality,
          photo: photoUrl,
          statement,
        }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(data.error ?? "Could not create account")
        return
      }

      router.push("/login")
    } catch {
      setError("Network error. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center py-12">
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

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="mb-8 scale-75">
          <Logo />
        </div>

        <div className="liquid-glass-panel rounded-[28px] p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Join Player IQ Hub</h2>
          <p className="text-muted-foreground text-center mb-6">Choose the account type before registering</p>

          <div className="grid grid-cols-2 gap-2 mb-6">
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

          {userType === "player" ? (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="liquid-glass-chip rounded-2xl p-4 mb-8">
              <p className="text-sm text-white/80">Administrator account with platform management permissions.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="bg-secondary/50 border-border focus:border-primary h-11"
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
                  placeholder="Create a password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border focus:border-primary h-11 pr-12"
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

            {userType === "player" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear" className="text-foreground">
                      Birth Year
                    </Label>
                    <Input
                      id="birthYear"
                      type="number"
                      placeholder="2012"
                      min="1990"
                      max="2020"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="bg-secondary/50 border-border focus:border-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-foreground">
                      Position
                    </Label>
                    <select
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full rounded-md border border-border bg-secondary/50 px-3 text-sm text-foreground focus:border-primary focus:outline-none h-11"
                    >
                      <option value="">Select position</option>
                      {footballPositions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-foreground">
                    Player Photo
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="bg-secondary/50 border-border focus:border-primary h-11 file:text-xs file:mr-3 file:bg-primary/20 file:border-0 file:px-3 file:py-2 file:rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="club" className="text-foreground">
                      Club
                    </Label>
                    <Input
                      id="club"
                      type="text"
                      placeholder="FC Westchester"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                      className="bg-secondary/50 border-border focus:border-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-foreground">
                      Nationality
                    </Label>
                    <Input
                      id="nationality"
                      type="text"
                      placeholder="USA"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="bg-secondary/50 border-border focus:border-primary h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statement" className="text-foreground">
                    Statement
                  </Label>
                  <Textarea
                    id="statement"
                    placeholder="I will prove myself to the world"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
              </>
            ) : (
              <div className="liquid-glass-chip rounded-2xl p-4">
                <p className="text-sm text-white/70">
                  Administrators are stored in the `users` table with `name` and `password`.
                </p>
              </div>
            )}

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider mt-6"
            >
              {isLoading ? "Creating account..." : `Create ${userType === "admin" ? "administrator" : "player"}`}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already registered?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
