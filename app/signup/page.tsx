"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const features = [
  "Access to all methodology videos",
  "Exclusive coaching content",
  "Community access & clip sharing",
  "Track your learning progress",
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate signup - in production, connect to real auth
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center py-12">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(207,56,0,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </Link>

      {/* Header links */}
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
        {/* Logo */}
        <div className="mb-8 scale-75">
          <Logo />
        </div>

        {/* Signup Form */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Join Player IQ Hub</h2>
          <p className="text-muted-foreground text-center mb-6">Start your journey to football mastery</p>

          {/* Features list */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nicholas"
                  required
                  className="bg-secondary/50 border-border focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Costa"
                  required
                  className="bg-secondary/50 border-border focus:border-primary h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="player@example.com"
                required
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
                  placeholder="Create a strong password"
                  required
                  className="bg-secondary/50 border-border focus:border-primary h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

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
                  required
                  className="bg-secondary/50 border-border focus:border-primary h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground">
                  Position
                </Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="Center Mid"
                  required
                  className="bg-secondary/50 border-border focus:border-primary h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider mt-6"
            >
              {isLoading ? "Creating account..." : "Subscribe & Start"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
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
