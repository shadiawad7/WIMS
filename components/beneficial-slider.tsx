"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"

interface BeneficialSliderProps {
  onSubmit: (value: number) => void
  initialValue?: number
}

export function BeneficialSlider({ onSubmit, initialValue = 50 }: BeneficialSliderProps) {
  const [value, setValue] = useState(initialValue)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    onSubmit(value)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <ThumbsUp className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Thanks for your feedback!</h3>
        <p className="text-sm text-muted-foreground">You rated this video {value}% beneficial</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">How beneficial was this video?</h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Not Useful</span>
          <span className="text-2xl font-bold text-primary">{value}%</span>
          <span>Very Useful</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #CF3800 0%, #CF3800 ${value}%, rgba(255,255,255,0.1) ${value}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
      >
        Submit Rating
      </button>
    </div>
  )
}
