"use client"

import { useEffect, useRef, useState } from "react"
import { Play, X } from "lucide-react"

type DirectorPreviewVideoProps = {
  src: string
  title: string
}

export function DirectorPreviewVideo({ src, title }: DirectorPreviewVideoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const modalVideoRef = useRef<HTMLVideoElement | null>(null)

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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative w-56 md:w-64 aspect-video rounded-[18px] border border-white/20 overflow-hidden text-left"
      >
        <video
          src={src}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition-transform group-hover:scale-105">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </div>
        </div>
      </button>

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
              <video
                ref={modalVideoRef}
                src={src}
                className="h-full w-full object-cover"
                controls
                autoPlay
                playsInline
                preload="auto"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
