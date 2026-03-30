import { DashboardHeader } from "@/components/dashboard-header"
import { VideoPageContent } from "@/components/video-page-content"
import { getSessionFromCookies } from "@/lib/auth"
import { getModuleMeta } from "@/lib/module-metadata"
import { getModuleVideos } from "@/lib/module-videos"
import { getPassedVideoIdsForUser, getQuizForVideo } from "@/lib/video-quiz"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function VideoPage({
  params,
}: {
  params: Promise<{ moduleId: string; videoId: string }>
}) {
  const { moduleId, videoId } = await params
  const session = getSessionFromCookies(await cookies())
  const moduleMeta = await getModuleMeta(moduleId)

  if (!moduleMeta) {
    notFound()
  }

  const videos = await getModuleVideos(moduleMeta.id)
  if (videos.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="relative z-10">
          <DashboardHeader />
          <div className="px-4 md:px-8 py-10">
            <p className="text-white/70">No videos available in this module yet.</p>
          </div>
        </div>
      </main>
    )
  }

  const passedVideoIds =
    session?.role === "player" ? await getPassedVideoIdsForUser(session.id, moduleMeta.id) : new Set<string>()
  const normalizedVideos = videos.map((video) =>
    passedVideoIds.has(video.id)
      ? {
          ...video,
          status: "completed" as const,
        }
      : video,
  )
  const selectedVideo = normalizedVideos.find((video) => video.id === videoId) || normalizedVideos[0]
  const { quiz, result } = await getQuizForVideo(moduleMeta.id, selectedVideo.id, {
    includeCorrectAnswers: session?.role === "admin",
    userId: session?.role === "player" ? session.id : undefined,
    questionCount: session?.role === "player" ? 3 : undefined,
  })

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />
        <VideoPageContent
          moduleId={moduleMeta.id}
          moduleName={moduleMeta.name}
          video={selectedVideo}
          role={session?.role ?? null}
          initialQuiz={quiz}
          initialQuizResult={result}
        />
      </div>
    </main>
  )
}
