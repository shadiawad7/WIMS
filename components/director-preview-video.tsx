"use client"

import { useEffect, useRef, useState } from "react"
import { Pencil, Play, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"

type DirectorPreviewVideoProps = {
  moduleId: string
  src: string
  title: string
  isAdmin?: boolean
}

export function DirectorPreviewVideo({ moduleId, src, title, isAdmin = false }: DirectorPreviewVideoProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftUrl, setDraftUrl] = useState(src)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const modalVideoRef = useRef<HTMLVideoElement | null>(null)

  const isVimeo = /^https?:\/\/(?:www\.)?(?:player\.)?vimeo\.com\//i.test(src)
  const vimeoId = (() => {
    if (!isVimeo) {
      return ""
    }

    try {
      const parsed = new URL(src)
      const segments = parsed.pathname.split("/").filter(Boolean)
      for (let index = segments.length - 1; index >= 0; index -= 1) {
        if (/^\d+$/.test(segments[index])) {
          return segments[index]
        }
      }
    } catch {
      return ""
    }

    return ""
  })()

  useEffect(() => {
    setDraftUrl(src)
  }, [src])

  useEffect(() => {
    let active = true

    if (!isVimeo || !vimeoId) {
      setPreviewImage("")
      return
    }

    async function loadPreview() {
      try {
        const endpoint = new URL("https://vimeo.com/api/oembed.json")
        endpoint.searchParams.set("url", `https://vimeo.com/${vimeoId}`)
        const response = await fetch(endpoint.toString())
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { thumbnail_url?: string }
        if (active) {
          setPreviewImage(payload.thumbnail_url || "")
        }
      } catch {
        if (active) {
          setPreviewImage("")
        }
      }
    }

    void loadPreview()

    return () => {
      active = false
    }
  }, [isVimeo, vimeoId])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ""
      return
    }

    document.body.style.overflow = "hidden"

    const video = modalVideoRef.current
    if (video) {
      video.muted = false
      video.volume = 1
      void video.play().catch(() => {
        // Some browsers may still block autoplay with sound.
      })
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const closeModal = () => {
    const video = modalVideoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setIsOpen(false)
  }

  const closeEditModal = () => {
    setDraftUrl(src)
    setError("")
    setIsEditing(false)
  }

  const saveDirectorVideo = async (nextUrl: string) => {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directorVideoUrl: nextUrl,
        }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error || "Could not update director video")
        return
      }

      setIsEditing(false)
      router.refresh()
    } catch {
      setError("Network error while updating director video")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="relative w-56 md:w-64">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative aspect-video w-full rounded-[18px] border border-white/20 overflow-hidden text-left"
        >
          {isVimeo ? (
            <>
              {previewImage ? (
                <img src={previewImage} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black/40 text-sm uppercase tracking-[0.2em] text-white/55">
                  Vimeo Preview
                </div>
              )}
            </>
          ) : (
            <video
              src={src}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )}
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition-transform group-hover:scale-105">
              <Play className="ml-1 h-6 w-6 fill-current" />
            </div>
          </div>
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/85 shadow-lg backdrop-blur-md transition-colors hover:text-white"
            aria-label="Edit director video"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="liquid-glass-panel relative w-full max-w-5xl rounded-[28px] p-4 md:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 transition-colors hover:text-white"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 pr-12 text-sm uppercase tracking-[0.24em] text-white/55">
              {title}
            </div>

            <div className="overflow-hidden rounded-[22px] border border-white/15 bg-black/40">
              {isVimeo && vimeoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&vimeo_logo=0`}
                  className="aspect-video h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              ) : (
                <video
                  ref={modalVideoRef}
                  src={src}
                  className="h-full w-full object-cover"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
          onClick={closeEditModal}
        >
          <div
            className="liquid-glass-panel relative w-full max-w-2xl rounded-[28px] p-5 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEditModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 transition-colors hover:text-white"
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 pr-12">
              <h3 className="text-lg font-semibold uppercase tracking-[0.18em] text-white">
                Director Video
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Reemplaza o elimina el video del director de este módulo.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-white/80">Video URL</label>
              <input
                type="text"
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
                placeholder="/Pau_Llacer.mov or https://..."
              />
              <p className="text-xs text-white/45">
                Déjalo vacío si quieres eliminar el video completamente.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => saveDirectorVideo(draftUrl.trim())}
                disabled={isSaving}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => saveDirectorVideo("")}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/6 px-4 py-2 font-medium text-white/80 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove video
              </button>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
