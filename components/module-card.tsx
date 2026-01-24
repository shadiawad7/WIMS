"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { ProgressCircle } from "./progress-circle"

interface ModuleCardProps {
  module: {
    id: string
    name: string
    director: string
    description: string
    completion: number
    locked?: boolean
    unlockTime?: string
    thumbnail: string
  }
}

export function ModuleCard({ module }: ModuleCardProps) {
  if (module.locked) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden opacity-70 cursor-not-allowed shadow-lg border border-white/15 transition-transform duration-300 transform-gpu translate-y-0 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="relative h-40">
          <img
            src={module.thumbnail}
            alt={module.name}
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Lock className="w-8 h-8 text-white mb-2" />
            <span className="text-xs uppercase tracking-wider text-white/80">
              Exclusive Content
            </span>
            <span className="text-sm text-primary font-semibold">
              {module.unlockTime}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">
            {module.name}
          </h3>

          {/* LINEA MAS FUERTE */}
          <div className="h-[2px] bg-gradient-to-r from-primary to-primary/20 mb-2" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-base text-white/80 font-medium">
                <span className="uppercase">Director:</span> {module.director}
              </p>
              <p className="text-base text-white/60 mt-1 line-clamp-2">
                {module.description}
              </p>
            </div>

            <ProgressCircle percentage={0} size={80} strokeWidth={4} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link href={`/module/${module.id}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-lg border border-white/15 hover:border-primary/40 transform-gpu hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="relative h-40 overflow-hidden">
          <img
            src={module.thumbnail}
            alt={module.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="p-4">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {module.name}
          </h3>

          {/* LINEA MAS FUERTE */}
          <div className="h-[2px] bg-gradient-to-r from-primary to-primary/20 mb-2" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-base text-white/80 font-medium">
                <span className="uppercase">Director:</span> {module.director}
              </p>
              <p className="text-base text-white/60 mt-1 line-clamp-2">
                {module.description}
              </p>
            </div>

            <ProgressCircle
              percentage={module.completion}
              size={80}
              strokeWidth={4}
              label="COMPLETE"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
