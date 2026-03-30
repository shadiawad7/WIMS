"use client"

import { Settings, Play, Video, Heart, Users, Trophy } from "lucide-react"
import Link from "next/link"

interface PlayerProfileProps {
  player: {
    name: string
    birthYear: number | null
    club: string
    position: string
    nationality: string
    highlights: number
    statement: string
    avatar: string
    progress: number
    continueWatching: number
    posts: number
    favorites: number
    communityMembers: number
    clipOfWeekend: string
  }
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  return (
    <div className="liquid-glass-panel rounded-[28px] p-5 pb-15 flex flex-col">
      <div className="relative z-10 origin-top scale-[1.05]">
        {/* Settings icon */}
        <div className="flex justify-end mb-3">
          <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {/* Profile header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-40 h-56 rounded-[24px] overflow-hidden ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
            <img
              src={player.avatar || "/placeholder.svg?height=256&width=192&query=soccer player portrait"}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-foreground">{player.name.toUpperCase()}</h2>
            </div>
            <dl className="grid grid-cols-[minmax(90px,120px)_1fr] gap-x-2 gap-y-2 text-sm items-start">
              <dt className="text-muted-foreground">Birth Year:</dt>
              <dd className="text-foreground text-right">{player.birthYear ?? "N/A"}</dd>
              <dt className="text-muted-foreground">Club:</dt>
              <dd className="text-foreground text-right whitespace-nowrap">{player.club}</dd>
              <dt className="text-muted-foreground">Position:</dt>
              <dd className="text-foreground text-right">{player.position}</dd>
              <dt className="text-muted-foreground">Nationality:</dt>
              <dd className="text-foreground text-right">{player.nationality}</dd>
              <dt className="text-muted-foreground">Highlights:</dt>
              <dd className="text-foreground text-right">{player.highlights}</dd>
            </dl>
          </div>
        </div>

        {/* Statement */}
        <div className="liquid-glass-chip rounded-2xl p-3 mb-5">
          <p className="text-xs italic text-muted-foreground text-center">"{player.statement}"</p>
          <p className="text-[11px] text-primary text-center mt-2">- {player.name}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress Bar:</span>
            <span className="text-xs font-bold text-primary">{player.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000"
              style={{ width: `${player.progress}%`, boxShadow: "0 0 10px rgba(207, 56, 0, 0.5)" }}
            />
          </div>
        </div>

        {/* Clip of the weekend */}
      <Link href="/dashboard/community" className="mb-10">
        <div className="liquid-glass-chip rounded-2xl p-3 transition-colors hover:bg-white/8">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Clip of the Weekend</span>
            </div>
            <p className="text-base font-bold text-foreground glow-text">{player.clipOfWeekend}</p>
          </div>
        </Link>

        {/* Quick stats */}
        <div className="space-y-2 mb-0 mt-4">
          <Link
            href="/dashboard/continue-watching"
            className="flex items-center justify-between p-2.5 liquid-glass-chip rounded-2xl transition-colors hover:bg-white/8"
          >
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground uppercase tracking-wide">Continue Watching:</span>
            </div>
            <span className="text-xs font-bold text-primary">{player.continueWatching} Videos</span>
          </Link>

          <Link
            href="/dashboard/community"
            className="flex items-center justify-between p-2.5 liquid-glass-chip rounded-2xl transition-colors hover:bg-white/8"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground uppercase tracking-wide">Community:</span>
            </div>
            <span className="text-xs font-bold text-primary">{player.communityMembers.toLocaleString()} Members</span>
          </Link>

          <Link
            href="/dashboard/posts"
            className="flex items-center justify-between p-2.5 liquid-glass-chip rounded-2xl transition-colors hover:bg-white/8"
          >
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground uppercase tracking-wide">Your Posts:</span>
            </div>
            <span className="text-xs font-bold text-primary">{player.posts} Clips</span>
          </Link>

          <Link
            href="/dashboard/favorites"
            className="flex items-center justify-between p-2.5 liquid-glass-chip rounded-2xl transition-colors hover:bg-white/8"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground uppercase tracking-wide">Favorites:</span>
            </div>
            <span className="text-xs font-bold text-primary">{player.favorites} Videos</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
