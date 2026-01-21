"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"

interface Video {
  id: string
  title: string
  coach: string
  thumbnail: string
  progress: number
  moduleId: string
}

interface ContinueWatchingCarouselProps {
  videos: Video[]
}

export function ContinueWatchingCarousel({ videos }: ContinueWatchingCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % videos.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }

  if (videos.length === 0) return null

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Continue Watching</h3>

      <div className="relative">
        <div className="flex gap-3 overflow-hidden">
          {videos.map((video, index) => (
            <Link
              key={video.id}
              href={`/video/${video.moduleId}/${video.id}`}
              className={`flex-shrink-0 w-32 transition-all duration-300 ${
                index === activeIndex ? "opacity-100 scale-100" : "opacity-50 scale-95"
              }`}
            >
              <div className="relative rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-20 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white" />
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div className="h-full bg-primary" style={{ width: `${video.progress}%` }} />
                </div>
              </div>
              <p className="text-xs text-foreground mt-2 truncate">{video.title}</p>
              <p className="text-xs text-muted-foreground truncate">Coach: {video.coach}</p>
            </Link>
          ))}
        </div>

        {videos.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
