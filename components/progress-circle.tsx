"use client"

interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressCircle({ percentage, size = 80, strokeWidth = 6, label }: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: "drop-shadow(0 0 6px rgba(207, 56, 0, 0.5))",
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CF3800" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-foreground">{percentage}%</span>
        {label && <span className="text-[10px] text-white/90 uppercase">{label}</span>}
      </div>
    </div>
  )
}
