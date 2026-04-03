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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAutofilling, setIsAutofilling] = useState(false)

  useEffect(() => {
    if (effectiveRole) {
      return
    }

    const storedRole = window.localStorage.getItem("playerRole")
    if (storedRole === "admin" || storedRole === "player") {
      setEffectiveRole(storedRole)
    }
  }, [effectiveRole])

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
          return
        }
        reject(new Error("Could not read image file"))
      }
      reader.onerror = () => reject(new Error("Could not read image file"))
      reader.readAsDataURL(file)
    })

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

      let thumbnailUrl = thumbnail.trim()
      if (thumbnailFile) {
        const uploadBody = new FormData()
        uploadBody.append("file", thumbnailFile)

        const uploadResponse = await fetch("/api/blob/upload", {
          method: "POST",
          body: uploadBody,
        })

        const uploadData = (await uploadResponse.json()) as { error?: string; url?: string }
        if (!uploadResponse.ok || !uploadData.url) {
          thumbnailUrl = await fileToDataUrl(thumbnailFile)
        } else {
          thumbnailUrl = uploadData.url
        }
        setThumbnail(thumbnailUrl)
      }

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
          thumbnail: thumbnailUrl,
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

  const handleAutoFill = async () => {
    const trimmedUrl = videoUrl.trim()
    if (!trimmedUrl) {
      setError("Introduce primero la URL del video para rellenar automaticamente")
      return
    }

    setError("")
    setIsAutofilling(true)

    try {
      const response = await fetch("/api/video-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      const payload = (await response.json()) as {
        error?: string
        metadata?: {
          title?: string
          coach?: string
          duration?: string
          description?: string
          thumbnail?: string
          views?: number
        }
      }

      if (!response.ok || !payload.metadata) {
        setError(payload.error || "Could not fetch automatic metadata")
        return
      }

      setTitle(payload.metadata.title || "")
      setCoach(payload.metadata.coach || "")
      setDuration(payload.metadata.duration || "")
      setDescription(payload.metadata.description || "")
      setThumbnail(payload.metadata.thumbnail || "")
      setViews(String(payload.metadata.views ?? 0))
    } catch {
      setError("Network error while fetching metadata")
    } finally {
      setIsAutofilling(false)
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
            className="liquid-glass-panel relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] p-4 md:p-6"
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

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isAutofilling}
                className="rounded-lg border border-white/15 bg-white/6 px-4 py-2 text-sm font-medium text-white/85 disabled:opacity-50"
              >
                {isAutofilling ? "Rellenando..." : "Relleno automatico"}
              </button>
              <p className="text-xs text-white/45">
                Extrae titulo, coach, duracion, descripcion y thumbnail desde el video original.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
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

              <div className="space-y-2">
                <label className="text-sm text-white/80">Upload Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white file:mr-3 file:rounded-md file:border-0 file:bg-primary/20 file:px-3 file:py-2 file:text-xs"
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
