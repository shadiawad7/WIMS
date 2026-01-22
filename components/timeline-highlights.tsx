"use client"

import { Flag, Clock } from "lucide-react"

interface Highlight {
  id: string
  time: number
  user: string
  note?: string
}

interface TimelineHighlightsProps {
  highlights: Highlight[]
  duration: number
  onSeek: (time: number) => void
}

export function TimelineHighlights({ highlights, duration, onSeek }: TimelineHighlightsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <Flag className="w-4 h-4 text-primary" />
        Timeline Highlights
      </h3>

      {/* Visual timeline */}
      <div className="relative h-10 bg-secondary/50 rounded-lg mb-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center">
          {/* Timeline bar */}
          <div className="w-full h-2 bg-muted rounded-full mx-4" />
        </div>

        {/* Highlight markers */}
        {highlights.map((highlight) => (
          <button
            key={highlight.id}
            onClick={() => onSeek(highlight.time)}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-primary rounded-sm cursor-pointer hover:scale-110 transition-transform group"
            style={{ left: `${(highlight.time / duration) * 100}%`, marginLeft: "-8px" }}
            title={`${formatTime(highlight.time)} - ${highlight.user}`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatTime(highlight.time)}
            </div>
          </button>
        ))}
      </div>

      {/* Highlight list */}
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {highlights.length === 0 ? (
          <p className="text-muted-foreground text-xs text-center py-3">
            No highlights yet. Click the flag icon while watching to add one!
          </p>
        ) : (
          highlights.map((highlight) => (
            <button
              key={highlight.id}
              onClick={() => onSeek(highlight.time)}
              className="w-full flex items-center gap-3 p-2.5 glass-card rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{formatTime(highlight.time)}</p>
                <p className="text-[11px] text-muted-foreground truncate">Flagged by {highlight.user}</p>
              </div>
              <span className="text-[11px] text-primary">Jump to</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
