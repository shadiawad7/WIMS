import { DashboardHeader } from "@/components/dashboard-header"
import { VideoCard } from "@/components/video-card"
import { ContinueWatchingCarousel } from "@/components/continue-watching-carousel"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"

// Module data - in production this would come from a database
const modulesData: Record<
  string,
  {
    name: string
    director: string
    description: string
    videos: {
      id: string
      title: string
      coach: string
      duration: string
      popularity: number
      views: number
      beneficialRatio: number
      status: "completed" | "in-progress" | "start"
      thumbnail: string
      progress?: number
    }[]
  }
> = {
  methodology: {
    name: "METHODOLOGY",
    director: "XIMO",
    description: "Concepts of Football",
    videos: [
      {
        id: "depth-in-play",
        title: "Depth in Play",
        coach: "Ximo",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "completed",
        thumbnail: "/football-depth-play-tactical-analysis.jpg",
      },
      {
        id: "movement-off-ball",
        title: "Movement Off the Ball",
        coach: "Alvaro",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "in-progress",
        thumbnail: "/off-ball-movement-soccer-training.jpg",
        progress: 65,
      },
      {
        id: "numerical-superiority",
        title: "Numerical Superiority",
        coach: "Jose",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "start",
        thumbnail: "/numerical-superiority-football-tactics.jpg",
      },
      {
        id: "transitions",
        title: "Transitions",
        coach: "Ximo",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "start",
        thumbnail: "/football-transitions-attack-defense.jpg",
      },
      {
        id: "microcycle-mesocycle",
        title: "Microcycle / Mesocycle",
        coach: "Jorge",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "completed",
        thumbnail: "/training-periodization-football.jpg",
      },
      {
        id: "space-orientation",
        title: "Space and Orientation",
        coach: "Ximo",
        duration: "22:05",
        popularity: 78,
        views: 429,
        beneficialRatio: 92,
        status: "in-progress",
        thumbnail: "/spatial-awareness-soccer-field.jpg",
        progress: 30,
      },
    ],
  },
  "modern-footy": {
    name: "MODERN FOOTY",
    director: "NICO",
    description: "World Class Modern Style",
    videos: [
      {
        id: "tiki-taka",
        title: "Tiki-Taka Fundamentals",
        coach: "Nico",
        duration: "25:30",
        popularity: 85,
        views: 612,
        beneficialRatio: 94,
        status: "in-progress",
        thumbnail: "/tiki-taka-passing-football.jpg",
        progress: 45,
      },
      {
        id: "pressing",
        title: "High Press Systems",
        coach: "Nico",
        duration: "20:15",
        popularity: 82,
        views: 534,
        beneficialRatio: 91,
        status: "start",
        thumbnail: "/high-press-football-tactics.jpg",
      },
    ],
  },
  positions: {
    name: "POSITIONS",
    director: "FERMIN",
    description: "Master Your Position",
    videos: [
      {
        id: "central-midfield",
        title: "Central Midfield Mastery",
        coach: "Fermin",
        duration: "28:45",
        popularity: 90,
        views: 723,
        beneficialRatio: 95,
        status: "start",
        thumbnail: "/central-midfielder-football-position.jpg",
      },
    ],
  },
  "physical-prep": {
    name: "PHYSICAL PREP",
    director: "DAVID",
    description: "Prevent Injuries & Prepare Body",
    videos: [
      {
        id: "warm-up",
        title: "Dynamic Warm-Up Routines",
        coach: "David",
        duration: "15:20",
        popularity: 88,
        views: 892,
        beneficialRatio: 96,
        status: "completed",
        thumbnail: "/football-warm-up-exercises.jpg",
      },
      {
        id: "mobility-flow",
        title: "Mobility Flow for Footballers",
        coach: "David",
        duration: "18:10",
        popularity: 84,
        views: 641,
        beneficialRatio: 93,
        status: "in-progress",
        thumbnail: "/soccer-player-fitness-training-gym.jpg",
        progress: 52,
      },
      {
        id: "core-stability",
        title: "Core Stability and Balance",
        coach: "David",
        duration: "16:45",
        popularity: 81,
        views: 588,
        beneficialRatio: 91,
        status: "start",
        thumbnail: "/training-periodization-football.jpg",
      },
      {
        id: "speed-mechanics",
        title: "Acceleration and Sprint Mechanics",
        coach: "David",
        duration: "20:05",
        popularity: 87,
        views: 734,
        beneficialRatio: 94,
        status: "start",
        thumbnail: "/football-transitions-attack-defense.jpg",
      },
      {
        id: "injury-prevention",
        title: "Injury Prevention Essentials",
        coach: "David",
        duration: "19:30",
        popularity: 89,
        views: 812,
        beneficialRatio: 95,
        status: "completed",
        thumbnail: "/off-ball-movement-soccer-training.jpg",
      },
      {
        id: "recovery-protocols",
        title: "Recovery Protocols After Matchday",
        coach: "David",
        duration: "17:25",
        popularity: 83,
        views: 603,
        beneficialRatio: 92,
        status: "in-progress",
        thumbnail: "/spatial-awareness-soccer-field.jpg",
        progress: 35,
      },
    ],
  },
  "video-analysis": {
    name: "VIDEO ANALYSIS",
    director: "MIGUEL",
    description: "Concepts of Football",
    videos: [
      {
        id: "match-analysis",
        title: "Match Analysis Fundamentals",
        coach: "Miguel",
        duration: "32:10",
        popularity: 75,
        views: 445,
        beneficialRatio: 89,
        status: "in-progress",
        thumbnail: "/football-match-analysis-video.jpg",
        progress: 70,
      },
    ],
  },
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moduleData = modulesData[id] || modulesData["methodology"]
  const isMethodology = id === "methodology" || moduleData.name === "METHODOLOGY"

  const continueWatchingVideos = moduleData.videos
    .filter((v) => v.status === "in-progress")
    .map((v) => ({
      ...v,
      progress: v.progress || 50,
      moduleId: id,
    }))

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />

        <div className="px-4 md:px-8 py-6">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Module header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{moduleData.name}</h1>
              <div
                className={`h-1 ${isMethodology ? "w-[50vw]" : "w-24"} bg-gradient-to-r from-primary to-orange-500 rounded-full mb-4`}
              />
              <div className="flex items-start gap-4">
                <div className="relative w-36 h-24 rounded-[18px] border border-white/20 overflow-hidden">
                  <img
                    src="/soccer-player-fitness-training-gym.jpg"
                    alt={`Director ${moduleData.director}`}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/50 border border-white/40 p-2 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-white/80 text-2xl">
                    <span className="text-white font-medium">Director:</span> {moduleData.director}
                  </p>
                  <p className="text-sm text-white/60 mt-1">{moduleData.description}</p>
                </div>
              </div>
            </div>

            {/* Continue watching carousel */}
            <div className="w-full lg:w-auto lg:min-w-[320px]">
              <ContinueWatchingCarousel videos={continueWatchingVideos} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleData.videos.map((video) => (
              <VideoCard key={video.id} video={{ ...video, moduleId: id }} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
