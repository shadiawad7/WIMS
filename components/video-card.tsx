"use client"

import Link from "next/link"
import { Clock, TrendingUp, Eye, ThumbsUp, Play } from "lucide-react"

type VideoStatus = "completed" | "in-progress" | "start"

interface VideoCardProps {
  video: {
    id: string
    title: string
    coach: string
    duration: string
    popularity: number
    views: number
    beneficialRatio: number
    status: VideoStatus
    thumbnail: string
    moduleId: string
  }
}

export function VideoCard({ video }: VideoCardProps) {
  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-700 rounded-full">
            Completed
          </span>
        )
      case "in-progress":
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-orange-100 text-primary rounded-full">
            In Progress
          </span>
        )
      case "start":
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-full">
            Start
          </span>
        )
    }
  }

  return (
    <Link href={`/video/${video.moduleId}/${video.id}`}>
      <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/30 h-full flex flex-col">
        {/* Thumbnail - square aspect ratio */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/45 border border-white/50 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm transform-gpu transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute top-2 right-2">{getStatusBadge(video.status)}</div>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2 uppercase">
              {video.title}
            </h3>
            <p className="text-sm text-gray-500">Coach: {video.coach}</p>
          </div>

          {/* Stats - 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Duration</p>
                <p className="text-sm font-semibold text-gray-800">{video.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Popularity</p>
                <p className="text-sm font-semibold text-gray-800">{video.popularity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Views</p>
                <p className="text-sm font-semibold text-gray-800">{video.views.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Beneficial</p>
                <p className="text-sm font-semibold text-gray-800">{video.beneficialRatio}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
