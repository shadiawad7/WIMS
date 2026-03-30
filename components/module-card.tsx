"use client"
import { Lock } from "lucide-react"
import { buildModuleHref } from "@/lib/routes"
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
      <div className="liquid-glass-panel rounded-[26px] overflow-hidden opacity-75 cursor-not-allowed transition-transform duration-300 transform-gpu translate-y-0 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(0,0,0,0.42)]">
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

          <div className="relative min-h-[8.5rem]">
            <p className="flex items-center gap-1 text-base text-white/80 font-medium whitespace-nowrap min-w-0">
              <span className="uppercase shrink-0">Director:</span>
              <span className="block flex-1 min-w-0">{module.director}</span>
            </p>
            <div className="pr-20">
              <p className="text-base text-white/60 mt-1 line-clamp-2">
                {module.description}
              </p>
            </div>

            <div className="absolute right-0 bottom-0 shrink-0">
              <ProgressCircle percentage={0} size={72} strokeWidth={4} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <a href={buildModuleHref(module.id)}>
      <div className="liquid-glass-panel rounded-[26px] overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group hover:border-primary/45 transform-gpu hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(0,0,0,0.42)]">
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

          <div className="relative min-h-[8.5rem]">
            <p className="flex items-center gap-1 text-base text-white/80 font-medium whitespace-nowrap min-w-0">
              <span className="uppercase shrink-0">Director:</span>
              <span className="block flex-1 min-w-0">{module.director}</span>
            </p>
            <div className="pr-20">
              <p className="text-base text-white/60 mt-1 line-clamp-2">
                {module.description}
              </p>
            </div>

            <div className="absolute right-0 bottom-0 shrink-0">
              <ProgressCircle
                percentage={module.completion}
                size={72}
                strokeWidth={4}
                label="COMPLETE"
              />
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}
