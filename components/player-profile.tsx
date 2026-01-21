"use client"

import { Settings, ExternalLink, Play, Video, Heart, Users, Trophy } from "lucide-react"
import Link from "next/link"

interface PlayerProfileProps {
  player: {
    name: string
    birthYear: number
    club: string
    position: string
    nationality: string
    highlightsLink: string
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
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      {/* Settings icon */}
      <div className="flex justify-end mb-4">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
          <img
            src={player.avatar || "/placeholder.svg?height=96&width=96&query=soccer player portrait"}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-foreground">{player.name}</h2>
      </div>

      {/* Player details */}
      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birth Year:</span>
          <span className="text-foreground">{player.birthYear}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Club:</span>
          <span className="text-foreground">{player.club}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Position:</span>
          <span className="text-foreground">{player.position}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nationality:</span>
          <span className="text-foreground">{player.nationality}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Highlights:</span>
          <Link href={player.highlightsLink} className="text-primary hover:underline flex items-center gap-1">
            View <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Statement */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <p className="text-sm italic text-muted-foreground text-center">"{player.statement}"</p>
        <p className="text-xs text-primary text-center mt-2">- {player.name}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Progress Bar:</span>
          <span className="text-sm font-bold text-primary">{player.progress}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000"
            style={{ width: `${player.progress}%`, boxShadow: "0 0 10px rgba(207, 56, 0, 0.5)" }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-3 mb-6">
        <Link
          href="/dashboard/continue-watching"
          className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Continue Watching:</span>
          </div>
          <span className="text-sm font-bold text-primary">{player.continueWatching} Videos</span>
        </Link>

        <Link
          href="/dashboard/posts"
          className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Video className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Your Posts:</span>
          </div>
          <span className="text-sm font-bold text-primary">{player.posts} Clips</span>
        </Link>

        <Link
          href="/dashboard/favorites"
          className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Favorites:</span>
          </div>
          <span className="text-sm font-bold text-primary">{player.favorites} Videos</span>
        </Link>

        <Link
          href="/dashboard/community"
          className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Community:</span>
          </div>
          <span className="text-sm font-bold text-primary">{player.communityMembers.toLocaleString()} Members</span>
        </Link>
      </div>

      {/* Clip of the weekend */}
      <Link href="/dashboard/community" className="mt-auto">
        <div className="glass-card rounded-lg p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Clip of the Weekend</span>
          </div>
          <p className="text-lg font-bold text-foreground glow-text">{player.clipOfWeekend}</p>
        </div>
      </Link>
    </div>
  )
}
