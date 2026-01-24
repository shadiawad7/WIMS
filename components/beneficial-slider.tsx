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
      <div className="glass-card rounded-xl p-4 text-center">
        <ThumbsUp className="w-8 h-8 text-primary mx-auto mb-2" />
        <h3 className="text-base font-semibold text-foreground mb-1">Thanks for your feedback!</h3>
        <p className="text-xs text-muted-foreground">You rated this video {value}% beneficial</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-base font-semibold text-foreground mb-3">HOW BENEFICIAL WAS THIS VIDEO?</h3>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Not Useful</span>
          <span className="text-xl font-bold text-primary">{value}%</span>
          <span>Very Useful</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #CF3800 0%, #CF3800 ${value}%, rgba(255,255,255,0.1) ${value}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
      >
        Submit Rating
      </button>
    </div>
  )
}
