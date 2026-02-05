"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Clock, TrendingUp, Eye, ThumbsUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { VideoPlayer } from "@/components/video-player"
import { TimelineHighlights } from "@/components/timeline-highlights"
import { BeneficialSlider } from "@/components/beneficial-slider"

const PHYSICAL_PREP_VIDEO_URL = "https://www.youtube.com/watch?app=desktop&v=JUWgJ3pmVfg&feature=youtu.be"

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
      videoSrc?: string
      description: string
      highlights: { id: string; time: number; user: string; note?: string }[]
    }
  >
> = {
  methodology: {
    "depth-in-play": {
      title: "DEPTH IN PLAY",
      coach: "Pau Llacer",
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
      coach: "Pau Llacer",
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
      coach: "Pau Llacer",
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
      coach: "Pau Llacer",
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
      coach: "Pau Llacer",
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
      coach: "Pau Llacer",
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
  "physical-prep": {
    "warm-up": {
      title: "Change Of Pace",
      coach: "Pau Llacer",
      duration: "4:16",
      durationSeconds: 4 * 60 + 16,
      popularity: 88,
      views: 892,
      beneficialRatio: 96,
      thumbnail: "/neymar.png",
      videoSrc: PHYSICAL_PREP_VIDEO_URL,
      description:
        "Build a complete pre-session warm-up focused on activation, movement quality, and injury-risk reduction.",
      highlights: [
        { id: "1", time: 120, user: "Mateo L." },
        { id: "2", time: 430, user: "Lucas R." },
      ],
    },
    "mobility-flow": {
      title: "Be the Most Dynamic",
      coach: "Pau Llacer",
      duration: "4:16",
      durationSeconds: 4 * 60 + 16,
      popularity: 88,
      views: 892,
      beneficialRatio: 96,
      thumbnail: "/Balance.png",
      videoSrc: PHYSICAL_PREP_VIDEO_URL,
      description:
        "Improve hip, ankle, and thoracic mobility to move efficiently and perform technical actions with less strain.",
      highlights: [{ id: "1", time: 360, user: "Sergio M." }],
    },
    "core-stability": {
      title: "Core Stability and Balance",
      coach: "Pau Llacer",
      duration: "16:45",
      durationSeconds: 16 * 60 + 45,
      popularity: 81,
      views: 588,
      beneficialRatio: 91,
      thumbnail: "/soccer-player-fitness-training-gym.jpg",
      description:
        "Train anti-rotation, trunk control, and balance to stay stable in duels, turns, and directional changes.",
      highlights: [],
    },
    "speed-mechanics": {
      title: "Acceleration and Sprint Mechanics",
      coach: "Pau Llacer",
      duration: "20:05",
      durationSeconds: 20 * 60 + 5,
      popularity: 87,
      views: 734,
      beneficialRatio: 94,
      thumbnail: "/football-transitions-attack-defense.jpg",
      description:
        "Learn sprint posture, first-step mechanics, and force application for faster acceleration in match situations.",
      highlights: [{ id: "1", time: 500, user: "Nicolas V." }],
    },
    "injury-prevention": {
      title: "Injury Prevention Essentials",
      coach: "Pau Llacer",
      duration: "19:30",
      durationSeconds: 19 * 60 + 30,
      popularity: 89,
      views: 812,
      beneficialRatio: 95,
      thumbnail: "/off-ball-movement-soccer-training.jpg",
      description:
        "Apply practical screening and strengthening routines to reduce common football injuries through the season.",
      highlights: [
        { id: "1", time: 260, user: "Adrian C." },
        { id: "2", time: 840, user: "Jorge N." },
      ],
    },
    "recovery-protocols": {
      title: "Recovery Protocols After Matchday",
      coach: "Pau Llacer",
      duration: "17:25",
      durationSeconds: 17 * 60 + 25,
      popularity: 83,
      views: 603,
      beneficialRatio: 92,
      thumbnail: "/spatial-awareness-soccer-field.jpg",
      description:
        "Structure post-match recovery with loading control, nutrition basics, and low-impact regeneration sessions.",
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
                <VideoPlayer
                  thumbnail={video.thumbnail}
                  title={video.title}
                  videoSrc={video.videoSrc}
                  durationSeconds={video.durationSeconds}
                  onAddHighlight={handleAddHighlight}
                />

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
