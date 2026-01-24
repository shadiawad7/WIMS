"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Clock, TrendingUp, Eye, ThumbsUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { VideoPlayer } from "@/components/video-player"
import { TimelineHighlights } from "@/components/timeline-highlights"
import { BeneficialSlider } from "@/components/beneficial-slider"

// Video data - in production this would come from a database
const videosData: Record<
  string,
  Record<
    string,
    {
      title: string
      coach: string
      duration: string
      durationSeconds: number
      popularity: number
      views: number
      beneficialRatio: number
      thumbnail: string
      description: string
      highlights: { id: string; time: number; user: string; note?: string }[]
    }
  >
> = {
  methodology: {
    "depth-in-play": {
      title: "DEPTH IN PLAY",
      coach: "Ximo",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/football-depth-play-tactical-analysis.jpg",
      description:
        "Learn the fundamental concepts of creating and utilizing depth in football. This video covers both offensive depth to stretch defenses and defensive depth to maintain compactness.",
      highlights: [
        { id: "1", time: 180, user: "Carlos M." },
        { id: "2", time: 420, user: "Luis A." },
        { id: "3", time: 780, user: "Diego R." },
        { id: "4", time: 1020, user: "Pedro S." },
      ],
    },
    "movement-off-ball": {
      title: "Movement Off the Ball",
      coach: "Alvaro",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/off-ball-movement-soccer-training.jpg",
      description: "Master the art of intelligent movement without the ball to create space and scoring opportunities.",
      highlights: [
        { id: "1", time: 240, user: "Marco T." },
        { id: "2", time: 600, user: "Juan P." },
      ],
    },
    "numerical-superiority": {
      title: "Numerical Superiority",
      coach: "Jose",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/numerical-superiority-football-tactics.jpg",
      description: "Understand how to create and exploit numerical advantages in different zones of the pitch.",
      highlights: [],
    },
    "space-orientation": {
      title: "Space and Orientation",
      coach: "Ximo",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/spatial-awareness-soccer-field.jpg",
      description: "Develop spatial awareness and understand how to orient your body for optimal play.",
      highlights: [{ id: "1", time: 350, user: "Antonio F." }],
    },
    transitions: {
      title: "Transitions",
      coach: "Ximo",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/football-transitions-attack-defense.jpg",
      description: "Learn the key principles of attacking and defensive transitions in modern football.",
      highlights: [],
    },
    "microcycle-mesocycle": {
      title: "Microcycle / Mesocycle",
      coach: "Jorge",
      duration: "22:05",
      durationSeconds: 22 * 60 + 5,
      popularity: 78,
      views: 429,
      beneficialRatio: 92,
      thumbnail: "/training-periodization-football.jpg",
      description: "Understand training periodization and how to structure your weekly and monthly training cycles.",
      highlights: [],
    },
  },
}

export default function VideoPage({ params }: { params: Promise<{ moduleId: string; videoId: string }> }) {
  const { moduleId, videoId } = use(params)
  const [isLiked, setIsLiked] = useState(false)
  const [highlights, setHighlights] = useState<{ id: string; time: number; user: string; note?: string }[]>([])
  const [seekTime, setSeekTime] = useState<number | null>(null)

  const moduleVideos = videosData[moduleId] || videosData["methodology"]
  const video = moduleVideos[videoId] || Object.values(moduleVideos)[0]

  // Initialize highlights from video data
  useState(() => {
    setHighlights(video.highlights || [])
  })

  const handleAddHighlight = (time: number) => {
    const newHighlight = {
      id: Date.now().toString(),
      time,
      user: "You",
    }
    setHighlights((prev) => [...prev, newHighlight].sort((a, b) => a.time - b.time))
  }

  const handleSeek = (time: number) => {
    setSeekTime(time)
    // Reset after seeking
    setTimeout(() => setSeekTime(null), 100)
  }

  const handleBeneficialSubmit = (value: number) => {
    console.log("[v0] Beneficial rating submitted:", value)
    // In production, this would be sent to the database
  }

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />

        <div className="px-4 md:px-8 py-6">
          {/* Back button */}
          <Link
            href={`/module/${moduleId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Module</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">
              <div className="w-full max-w-[760px] mx-auto space-y-5">
                {/* Video player */}
                <VideoPlayer thumbnail={video.thumbnail} title={video.title} onAddHighlight={handleAddHighlight} />

                {/* Timeline highlights */}
                <TimelineHighlights
                  highlights={[...video.highlights, ...highlights.filter((h) => h.user === "You")]}
                  duration={video.durationSeconds}
                  onSeek={handleSeek}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Video info */}
              <div className="glass-card rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-primary uppercase tracking-wider mb-1">Methodology</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{video.title}</h1>
                    <p className="text-muted-foreground mt-2">Coach: {video.coach}</p>
                  </div>

                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isLiked ? "bg-primary text-primary-foreground" : "glass-card hover:bg-white/10"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{isLiked ? "Favorited" : "Add to Favorites"}</span>
                  </button>
                </div>

                {/* Stats */}
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

              {/* Beneficial ratio slider */}
              <BeneficialSlider onSubmit={handleBeneficialSubmit} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
