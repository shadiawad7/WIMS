"use client"

import Link from "next/link"
import { Play } from "lucide-react"

export function StartButton() {
  return (
    <Link href="/login">
      <button className="group relative px-12 py-4 bg-primary/90 text-primary-foreground font-bold text-lg uppercase tracking-widest rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 animate-pulse-glow shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <span className="relative z-10 flex items-center gap-3">
          <Play className="w-5 h-5" />
          START
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#c85a1e] via-[#d86a2a] to-[#a64216] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </Link>
  )
}
