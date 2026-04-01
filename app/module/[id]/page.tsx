import { DashboardHeader } from "@/components/dashboard-header"
import { VideoCard } from "@/components/video-card"
import { ContinueWatchingCarousel } from "@/components/continue-watching-carousel"
import { AddVideoUrlForm } from "@/components/add-video-url-form"
import { BackToDashboardButton } from "@/components/back-to-dashboard-button"
import { DirectorPreviewVideo } from "@/components/director-preview-video"
import { getSessionFromCookies } from "@/lib/auth"
import { getModuleMeta } from "@/lib/module-metadata"
import { getModuleVideos } from "@/lib/module-videos"
import { getPassedVideoIdsForUser } from "@/lib/video-quiz"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = getSessionFromCookies(await cookies())
  const moduleData = await getModuleMeta(id)

  if (!moduleData) {
    notFound()
  }

  const baseVideos = await getModuleVideos(id)
  const passedVideoIds =
    session?.role === "player" ? await getPassedVideoIdsForUser(session.id, moduleData.id) : new Set<string>()
  const videos = baseVideos.map((video) =>
    passedVideoIds.has(video.id)
      ? {
          ...video,
          status: "completed" as const,
        }
      : video,
  )

  const continueWatchingVideos = videos
    .filter((video) => video.status === "in-progress")
    .map((video) => ({
      ...video,
      progress: video.progress || 50,
      moduleId: moduleData.id,
    }))

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />

        <div className="px-4 md:px-8 py-6">
          <BackToDashboardButton
            sessionId={session?.id}
            sessionName={session?.name}
            sessionRole={session?.role}
          />

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{moduleData.name}</h1>
              <div className="h-1 w-[50vw] bg-gradient-to-r from-primary to-orange-500 rounded-full mb-4" />
              <div className="flex items-start gap-4">
                {moduleData.directorVideoUrl ? (
                  <DirectorPreviewVideo
                    moduleId={moduleData.id}
                    src={moduleData.directorVideoUrl}
                    title={moduleData.director}
                    isAdmin={session?.role === "admin"}
                  />
                ) : null}
                <div>
                  <p className="text-white/80 text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                    <span className="text-white font-bold">DIRECTOR:</span> {moduleData.director}
                  </p>
                  <p className="text-sm text-white/60 mt-1">{moduleData.description}</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[320px]">
              <ContinueWatchingCarousel videos={continueWatchingVideos} />
            </div>
          </div>

          <div className="mb-6 max-w-3xl">
            <AddVideoUrlForm
              moduleId={moduleData.id}
              initialRole={session?.role}
              sessionId={session?.id}
              sessionName={session?.name}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={{ ...video, moduleId: moduleData.id }} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
