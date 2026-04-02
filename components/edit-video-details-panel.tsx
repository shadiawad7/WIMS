"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, X } from "lucide-react"
import type { ModuleVideo } from "@/lib/module-videos"
import { buildModuleHref } from "@/lib/routes"
import type { UserRole } from "@/lib/auth"

type EditVideoDetailsPanelProps = {
  moduleId: string
  video: ModuleVideo
  initialRole?: UserRole | null
}

export function EditVideoDetailsPanel({ moduleId, video, initialRole = null }: EditVideoDetailsPanelProps) {
  const router = useRouter()
  const [effectiveRole, setEffectiveRole] = useState<UserRole | null>(initialRole)
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(video.title)
  const [coach, setCoach] = useState(video.coach)
  const [duration, setDuration] = useState(video.duration)
  const [popularity, setPopularity] = useState(String(video.popularity))
  const [views, setViews] = useState(String(video.views))
  const [beneficialRatio, setBeneficialRatio] = useState(String(video.beneficialRatio))
  const [description, setDescription] = useState(video.description)
  const [videoUrl, setVideoUrl] = useState(video.videoSrc || "")
  const [thumbnail, setThumbnail] = useState(video.thumbnail)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (effectiveRole) {
      return
    }

    const storedRole = window.localStorage.getItem("playerRole")
    if (storedRole === "admin" || storedRole === "player") {
      setEffectiveRole(storedRole)
    }
  }, [effectiveRole])

  const restoreAdminSession = async () => {
    const id = Number(window.localStorage.getItem("playerId"))
    const name = window.localStorage.getItem("playerName") ?? ""
    const role = effectiveRole ?? window.localStorage.getItem("playerRole")

    if (!Number.isInteger(id) || id <= 0 || !name || role !== "admin") {
      return
    }

    await fetch("/api/auth/restore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        name,
        role,
      }),
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await restoreAdminSession()

      const response = await fetch(`/api/modules/${moduleId}/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          coach,
          duration,
          popularity: Number(popularity),
          views: Number(views),
          beneficialRatio: Number(beneficialRatio),
          description,
          videoUrl,
          thumbnail,
        }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error || "Could not update video")
        return
      }

      setIsOpen(false)
      router.refresh()
    } catch {
      setError("Network error while updating video")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setError("")
    setIsDeleting(true)

    try {
      await restoreAdminSession()

      const response = await fetch(`/api/modules/${moduleId}/videos/${video.id}`, {
        method: "DELETE",
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error || "Could not delete video")
        return
      }

      window.location.assign(buildModuleHref(moduleId))
    } catch {
      setError("Network error while deleting video")
    } finally {
      setIsDeleting(false)
    }
  }

  if (effectiveRole !== "admin") {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/6 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
      >
        <Pencil className="h-4 w-4" />
        Edit Video
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="liquid-glass-panel relative w-full max-w-3xl rounded-[28px] p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 transition-colors hover:text-white"
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 pr-12">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-white">Edit Video</h3>
              <p className="mt-2 text-sm text-white/55">
                Actualiza el título y las métricas de esta ficha o elimina el video del módulo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-white/80">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Coach</label>
                <input
                  value={coach}
                  onChange={(event) => setCoach(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Duration</label>
                <input
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                  placeholder="1:26"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Popularity %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={popularity}
                  onChange={(event) => setPopularity(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Views</label>
                <input
                  type="number"
                  min="0"
                  value={views}
                  onChange={(event) => setViews(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Beneficial %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={beneficialRatio}
                  onChange={(event) => setBeneficialRatio(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Thumbnail URL</label>
                <input
                  value={thumbnail}
                  onChange={(event) => setThumbnail(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-white/80">Video URL</label>
                <input
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-white/80">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Video"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/6 px-4 py-2 font-medium text-white/85 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Video"}
                </button>
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
