"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { ModuleMeta } from "@/lib/module-metadata"

type EditModulePanelProps = {
  modules: ModuleMeta[]
}

export function EditModulePanel({ modules }: EditModulePanelProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(modules[0]?.id ?? "")
  const [name, setName] = useState("")
  const [director, setDirector] = useState("")
  const [directorVideoUrl, setDirectorVideoUrl] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [completion, setCompletion] = useState("0")
  const [locked, setLocked] = useState(false)
  const [unlockTime, setUnlockTime] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const selectedModule = modules.find((module) => module.id === selectedId) || modules[0]

  useEffect(() => {
    if (!selectedModule) return
    setName(selectedModule.name)
    setDirector(selectedModule.director)
    setDirectorVideoUrl(selectedModule.directorVideoUrl || "")
    setDescription(selectedModule.description)
    setThumbnail(selectedModule.thumbnail)
    setCompletion(String(selectedModule.completion))
    setLocked(Boolean(selectedModule.locked))
    setUnlockTime(selectedModule.unlockTime || "")
    setImageFile(null)
    setError("")
    setSuccess("")
  }, [selectedModule])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedModule) return

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const id = Number(window.localStorage.getItem("playerId"))
      const userName = window.localStorage.getItem("playerName") ?? ""
      const userRole = window.localStorage.getItem("playerRole") ?? ""

      if (Number.isInteger(id) && id > 0 && userName && userRole === "admin") {
        await fetch("/api/auth/restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            name: userName,
            role: userRole,
          }),
        })
      }

      let thumbnailUrl = thumbnail.trim()
      if (imageFile) {
        const uploadBody = new FormData()
        uploadBody.append("file", imageFile)

        const uploadResponse = await fetch("/api/blob/upload", {
          method: "POST",
          body: uploadBody,
        })
        const uploadData = (await uploadResponse.json()) as { error?: string; url?: string }
        if (!uploadResponse.ok || !uploadData.url) {
          setError(uploadData.error || "Could not upload module image")
          return
        }
        thumbnailUrl = uploadData.url
        setThumbnail(uploadData.url)
      }

      const response = await fetch(`/api/modules/${selectedModule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          userName,
          userRole,
          name,
          director,
          directorVideoUrl,
          description,
          thumbnail: thumbnailUrl,
          completion: Number(completion),
          locked,
          unlockTime,
        }),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(payload.error || "Could not update module")
        return
      }

      setSuccess("Module updated")
      router.refresh()
    } catch {
      setError("Network error while updating module")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedModule) {
    return null
  }

  return (
    <div className="liquid-glass-panel rounded-[28px] p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Edit Modules</h3>
          <p className="text-sm text-white/60">Only administrators can change module content and artwork.</p>
        </div>
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id} className="text-black">
              {module.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-white/80">Title</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Director</label>
          <input
            value={director}
            onChange={(event) => setDirector(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
            required
          />
        </div>

        <div className="space-y-3 lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
                Director Video
              </h4>
              <p className="mt-1 text-xs text-white/50">
                Reemplaza o elimina el video pequeño que aparece arriba a la izquierda dentro del módulo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDirectorVideoUrl("")}
              className="rounded-lg border border-white/15 bg-white/6 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:text-white"
            >
              Remove video
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Director Video URL</label>
            <input
              type="text"
              value={directorVideoUrl}
              onChange={(event) => setDirectorVideoUrl(event.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
              placeholder="/Pau_Llacer.mov or https://..."
            />
            <p className="text-xs text-white/45">
              Déjalo vacío para eliminar el video del director en este módulo.
            </p>
          </div>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label className="text-sm text-white/80">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-24 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Thumbnail URL</label>
          <input
            type="text"
            value={thumbnail}
            onChange={(event) => setThumbnail(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
            placeholder="/football-tactics-whiteboard-strategy.jpg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Upload New Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white file:mr-3 file:rounded-md file:border-0 file:bg-primary/20 file:px-3 file:py-2 file:text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Completion %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={completion}
            onChange={(event) => setCompletion(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80">Unlock Time</label>
          <input
            value={unlockTime}
            onChange={(event) => setUnlockTime(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white"
            placeholder="Unlock at 7 Months"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-white/80">
          <input type="checkbox" checked={locked} onChange={(event) => setLocked(event.target.checked)} />
          Locked module
        </label>

        <div className="flex items-center gap-3 lg:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Module"}
          </button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        </div>
      </form>
    </div>
  )
}
