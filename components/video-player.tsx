"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Flag } from "lucide-react"

interface VideoPlayerProps {
  thumbnail: string
  title: string
  videoSrc?: string
  durationSeconds?: number
  onAddHighlight?: (time: number) => void
}

const isYouTubeUrl = (url?: string) => Boolean(url && /(youtube\.com|youtu\.be)/i.test(url))

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    let videoId = parsed.searchParams.get("v")

    if (!videoId && parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.replace("/", "")
    }

    if (!videoId && parsed.pathname.includes("/shorts/")) {
      videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || ""
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url
  } catch {
    return url
  }
}

export function VideoPlayer({ thumbnail, title, videoSrc, durationSeconds, onAddHighlight }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 22 * 60 + 5)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const progressRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isYouTube = isYouTubeUrl(videoSrc)
  const youtubeEmbedSrc = videoSrc && isYouTube ? getYouTubeEmbedUrl(videoSrc) : ""

  useEffect(() => {
    if (videoSrc) return
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, videoSrc])

  useEffect(() => {
    const element = videoRef.current
    if (!element || !videoSrc) return
    element.muted = isMuted
  }, [isMuted, videoSrc])

  useEffect(() => {
    const element = videoRef.current
    if (!element || !videoSrc) return
    element.volume = Math.max(0, Math.min(1, volume / 100))
  }, [volume, videoSrc])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = Math.floor(percentage * duration)
    setCurrentTime(newTime)
    if (videoRef.current && videoSrc) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleAddHighlight = () => {
    onAddHighlight?.(currentTime)
  }

  const progress = (currentTime / duration) * 100

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
      {/* Video thumbnail/content */}
      {isYouTube ? (
        <iframe
          src={youtubeEmbedSrc}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const metadataDuration = e.currentTarget.duration
            if (Number.isFinite(metadataDuration) && metadataDuration > 0) {
              setDuration(Math.floor(metadataDuration))
            }
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      ) : (
        <img src={thumbnail || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
      )}

      {/* Play overlay when paused */}
      {!isYouTube && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button
            onClick={() => {
              if (videoRef.current && videoSrc) {
                void videoRef.current.play()
              } else {
                setIsPlaying(true)
              }
            }}
            className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 glow-orange"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Controls overlay */}
      {!isYouTube && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => {
                if (videoRef.current && videoSrc) {
                  if (isPlaying) {
                    videoRef.current.pause()
                  } else {
                    void videoRef.current.play()
                  }
                } else {
                  setIsPlaying(!isPlaying)
                }
              }}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Skip buttons */}
            <button
              onClick={() => {
                const newTime = Math.max(0, currentTime - 10)
                setCurrentTime(newTime)
                if (videoRef.current && videoSrc) {
                  videoRef.current.currentTime = newTime
                }
              }}
              className="text-white hover:text-primary transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const newTime = Math.min(duration, currentTime + 10)
                setCurrentTime(newTime)
                if (videoRef.current && videoSrc) {
                  videoRef.current.currentTime = newTime
                }
              }}
              className="text-white hover:text-primary transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Flag/Highlight button */}
            <button
              onClick={handleAddHighlight}
              className="text-white hover:text-primary transition-colors flex items-center gap-1"
              title="Flag this moment"
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  setIsMuted(false)
                }}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Fullscreen */}
            <button className="text-white hover:text-primary transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
