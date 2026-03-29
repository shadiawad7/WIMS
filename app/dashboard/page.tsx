import { DashboardHeader } from "@/components/dashboard-header"
import { EditModulePanel } from "@/components/edit-module-panel"
import { PlayerProfile } from "@/components/player-profile"
import { ModuleCard } from "@/components/module-card"
import { getSessionFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"
import { getDashboardModules } from "@/lib/module-metadata"
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

type AdminRow = {
  id: number
  name: string
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = getSessionFromCookies(cookieStore)

  if (!session) {
    redirect("/login")
  }

  const modules = await getDashboardModules()
  const visibleModules = modules.map((module) => {
    if (session.role === "admin") {
      return {
        ...module,
        locked: false,
      }
    }

    return module
  })

  let playerData

  if (session.role === "player") {
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
      WHERE LOWER(name) = LOWER($1)
      ORDER BY id DESC
      LIMIT 1
      `,
      [session.name],
    )

    const player = rows[0]
    if (!player) {
      redirect("/login")
    }

    playerData = {
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
  } else {
    const { rows } = await query<AdminRow>(
      `
      SELECT id, name
      FROM admins
      WHERE id_user = $1
      LIMIT 1
      `,
      [session.id],
    )

    const admin = rows[0]
    if (!admin) {
      redirect("/login")
    }

    playerData = {
      name: admin.name,
      birthYear: null,
      club: "WIMS",
      position: "Administrator",
      nationality: "N/A",
      highlights: 0,
      statement: "Control total de la plataforma y los contenidos.",
      avatar: "/young-soccer-player-portrait.png",
      progress: 100,
      continueWatching: 0,
      posts: 0,
      favorites: 0,
      communityMembers: 0,
      clipOfWeekend: "ADMIN MODE",
    }
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

              {session.role === "admin" ? <EditModulePanel modules={modules} /> : null}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5">
                {visibleModules.map((module) => (
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
