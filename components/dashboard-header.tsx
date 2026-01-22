import Link from "next/link"
import { Settings, LogOut } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex justify-between items-center px-6 md:px-8 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-bold text-foreground">PLAYER IQ</span>
        <span className="text-xl font-bold text-white">HUB</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="https://www.wims.es"
          target="_blank"
          className="text-xs text-white/80 hover:text-white transition-colors hidden md:block"
        >
          Powered by WIMS GROUP
        </Link>

        <Link href="/settings" className="text-white/80 hover:text-white transition-colors p-2">
          <Settings className="w-5 h-5" />
        </Link>

        <Link href="/" className="text-white/80 hover:text-white transition-colors p-2">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}
