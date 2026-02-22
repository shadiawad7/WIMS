import { DashboardHeader } from "@/components/dashboard-header"
import { VideoPageContent } from "@/components/video-page-content"
import { getModuleMeta, getModuleVideos } from "@/lib/module-videos"
import { notFound } from "next/navigation"

export default async function VideoPage({
  params,
}: {
  params: Promise<{ moduleId: string; videoId: string }>
}) {
  const { moduleId, videoId } = await params
  const moduleMeta = getModuleMeta(moduleId)

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

  const selectedVideo = videos.find((video) => video.id === videoId) || videos[0]

  return (
    <main className="min-h-screen">
      <div className="relative z-10">
        <DashboardHeader />
        <VideoPageContent moduleId={moduleMeta.id} moduleName={moduleMeta.name} video={selectedVideo} />
      </div>
    </main>
  )
}
