import { DashboardHeader } from "@/components/dashboard-header"
import { PlayerProfile } from "@/components/player-profile"
import { ModuleCard } from "@/components/module-card"

// Sample data - in production this would come from a database
const playerData = {
  name: "Nicholas Costa",
  birthYear: 2012,
  club: "FC Westchester",
  position: "Center Mid",
  nationality: "USA & Brasil",
  highlightsLink: "#",
  statement: "I will prove myself to the world",
  avatar: "/young-soccer-player-portrait.png",
  progress: 72.7,
  continueWatching: 3,
  posts: 40,
  favorites: 7,
  communityMembers: 1740,
  clipOfWeekend: "GARRISON",
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

export default function DashboardPage() {
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
