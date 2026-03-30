import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSessionRestore } from "@/components/dashboard-session-restore"
import { EditModulePanel } from "@/components/edit-module-panel"
import { PlayerProfile } from "@/components/player-profile"
import { ModuleCard } from "@/components/module-card"
import { getSessionFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"
import { getDashboardModules } from "@/lib/module-metadata"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

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
    return <DashboardSessionRestore />
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
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Learning Hub
                </div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-[0.06em] text-white uppercase">
                      Football Portals
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm md:text-base text-white/58">
                      Structured modules, coaching pathways and premium analysis in one place.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-white/20 via-primary/35 to-transparent" />
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
