"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Heart, Clock, TrendingUp, Eye, ThumbsUp } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"
import { TimelineHighlights } from "@/components/timeline-highlights"
import { BeneficialSlider } from "@/components/beneficial-slider"
import type { ModuleVideo } from "@/lib/module-videos"
import { VideoQuizPanel } from "@/components/video-quiz-panel"
import type { UserRole } from "@/lib/auth"
import type { VideoQuiz, VideoQuizResult } from "@/lib/video-quiz"

type VideoPageContentProps = {
  moduleId: string
  moduleName: string
  video: ModuleVideo
  role: UserRole | null
  initialQuiz: VideoQuiz | null
  initialQuizResult: VideoQuizResult | null
}

export function VideoPageContent({
  moduleId,
  moduleName,
  video,
  role,
  initialQuiz,
  initialQuizResult,
}: VideoPageContentProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [userHighlights, setUserHighlights] = useState<{ id: string; time: number; user: string; note?: string }[]>(
    [],
  )

  const allHighlights = useMemo(
    () => [...video.highlights, ...userHighlights.filter((highlight) => highlight.user === "You")],
    [video.highlights, userHighlights],
  )

  const handleAddHighlight = (time: number) => {
    const newHighlight = {
      id: Date.now().toString(),
      time,
      user: "You",
    }
    setUserHighlights((previous) => [...previous, newHighlight].sort((a, b) => a.time - b.time))
  }

  const handleSeek = (_time: number) => {
    // Timeline markers stay wired to the UI; player seek is unchanged from existing behavior.
  }

  const handleBeneficialSubmit = (value: number) => {
    console.log("[wims] Beneficial rating submitted:", value)
  }

  return (
    <div className="px-4 md:px-8 py-6">
      <a
        href={`/module/${moduleId}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Module</span>
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="w-full max-w-[760px] mx-auto space-y-5">
            <VideoPlayer
              thumbnail={video.thumbnail}
              title={video.title}
              videoSrc={video.videoSrc}
              durationSeconds={video.durationSeconds}
              onAddHighlight={handleAddHighlight}
            />

            <TimelineHighlights highlights={allHighlights} duration={video.durationSeconds || 1} onSeek={handleSeek} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="liquid-glass-panel rounded-[24px] p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-primary uppercase tracking-wider mb-1">{moduleName}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{video.title}</h1>
                <p className="text-muted-foreground mt-2">Coach: {video.coach}</p>
              </div>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isLiked ? "bg-primary text-primary-foreground" : "liquid-glass-chip hover:bg-white/8"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{isLiked ? "Favorited" : "Add to Favorites"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Duration</p>
                  <p className="text-base font-semibold text-foreground">{video.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Popularity</p>
                  <p className="text-base font-semibold text-foreground">{video.popularity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Views</p>
                  <p className="text-base font-semibold text-foreground">{video.views.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Beneficial</p>
                  <p className="text-base font-semibold text-foreground">{video.beneficialRatio}%</p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{video.description}</p>
          </div>

          <BeneficialSlider onSubmit={handleBeneficialSubmit} />

          <VideoQuizPanel
            moduleId={moduleId}
            videoId={video.id}
            role={role}
            initialQuiz={initialQuiz}
            initialResult={initialQuizResult}
          />
        </div>
      </div>
    </div>
  )
}
