import { DashboardHeader } from "@/components/dashboard-header"
import { PlayerProfile } from "@/components/player-profile"
import { ModuleCard } from "@/components/module-card"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type PlayerRow = {
  id: number
  name: string
  birth_year: number | null
  club: string | null
  position: string | null
  nationality: string | null
  highlights: number | null
  photo: string | null
  statement: string | null
  watching: number | null
  community: number | null
  your_posts: number | null
  favorites: number | null
}

const modules = [
  {
    id: "methodology",
    name: "METHODOLOGY",
    director: "Pau Llacer",
    description: "Concepts of Football",
    completion: 27,
    thumbnail: "/football-tactics-whiteboard-strategy.jpg",
  },
  {
    id: "modern-footy",
    name: "MODERN FOOTY",
    director: "Pau Llacer",
    description: "World Class Modern Style",
    completion: 53,
    thumbnail: "/modern-football-barcelona-style-play.jpg",
  },
  {
    id: "physical-prep",
    name: "PHYSICAL PREP",
    director: "Pau Llacer",
    description: "Prevent Injuries & Prepare Body",
    completion: 92,
    thumbnail: "/soccer-player-fitness-training-gym.jpg",
  },
  {
    id: "positions",
    name: "POSITIONS",
    director: "Pau Llacer",
    description: "Master Your Position",
    completion: 17,
    thumbnail: "/soccer-field-positions-diagram.jpg",
  },
  {
    id: "video-analysis",
    name: "VIDEO ANALYSIS",
    director: "Pau Llacer",
    description: "Concepts of Football",
    completion: 72,
    thumbnail: "/football-video-analysis-screen-tactical.jpg",
  },
  {
    id: "wims-select",
    name: "WIMS SELECT",
    director: "Pau Llacer",
    description: "Exclusive Content",
    completion: 0,
    locked: true,
    unlockTime: "Unlock at 7 Months",
    thumbnail: "/vip-exclusive-premium-soccer-content.jpg",
  },
]

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionId = Number(cookieStore.get("player_session")?.value)

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    redirect("/login")
  }

  const { rows } = await query<PlayerRow>(
    `
    SELECT
      id,
      name,
      birth_year,
      club,
      position,
      nationality,
      highlights,
      photo,
      statement,
      watching,
      community,
      your_posts,
      favorites
    FROM players
    WHERE id = $1
    LIMIT 1
    `,
    [sessionId],
  )

  const player = rows[0]
  if (!player) {
    redirect("/login")
  }

  const playerData = {
    name: player.name,
    birthYear: player.birth_year,
    club: player.club || "N/A",
    position: player.position || "N/A",
    nationality: player.nationality || "N/A",
    highlights: player.highlights ?? 0,
    statement: player.statement || "No statement yet",
    avatar: player.photo || "/young-soccer-player-portrait.png",
    progress: 0,
    continueWatching: player.watching ?? 0,
    posts: player.your_posts ?? 0,
    favorites: player.favorites ?? 0,
    communityMembers: player.community ?? 0,
    clipOfWeekend: "COMING SOON",
  }

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />

        <div className="px-4 md:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar - Player Profile */}
            <aside className="w-full lg:w-96 xl:w-[28rem] flex-shrink-0">
              <PlayerProfile player={playerData} />
            </aside>

            {/* Right content - Modules */}
            <div className="flex-1">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 inline-flex mb-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white uppercase tracking-wider">
                  Football Portals Available
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5">
                {modules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
