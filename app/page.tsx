import { AnimatedCounter } from "@/components/animated-counter"
import { Logo } from "@/components/logo"
import { StartButton } from "@/components/start-button"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6">
        <Link
          href="https://www.wims.es"
          target="_blank"
          className="text-sm md:text-base font-semibold text-white/80 hover:text-white transition-colors tracking-wider"
        >
          WIMS GROUP
        </Link>
        <Link
          href="https://www.wims.es"
          target="_blank"
          className="text-xs md:text-sm text-white/60 hover:text-white transition-colors"
        >
          Powered by WIMS GROUP
        </Link>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {/* Logo */}
        <div className="mb-16 mt-8">
          <Logo />
        </div>

        {/* Stats section - glass card */}
        <div className="glass-card rounded-2xl px-8 md:px-16 py-10 mb-16 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <AnimatedCounter end={2893} label="Members" />
            <AnimatedCounter end={89322} label="Minutes Watched" />
            <AnimatedCounter end={237} label="Videos Available" />
          </div>
        </div>

        {/* Start button */}
        <StartButton />
      </div>

      {/* Footer decoration - white accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </main>
  )
}
