import Link from "next/link"
import { Settings, LogOut } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="liquid-glass-panel flex justify-between items-center px-6 md:px-8 py-4 rounded-none border-x-0 border-t-0">
      <a href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-bold text-foreground">PLAYER IQ</span>
        <span className="text-xl font-bold text-primary">HUB</span>
      </a>

      <div className="flex items-center gap-4">
        <Link
          href="https://www.wims.es"
          target="_blank"
          className="text-xs text-white hover:text-white/90 transition-colors hidden md:block"
        >
          Powered by WIMS GROUP
        </Link>

        <Link href="/settings" className="text-white hover:text-white/90 transition-colors p-2">
          <Settings className="w-5 h-5" />
        </Link>

        <Link href="/api/auth/logout" className="text-white hover:text-white/90 transition-colors p-2">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}
