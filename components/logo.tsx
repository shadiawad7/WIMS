export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900">PLAYER IQ</h1>
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary glow-text">HUB</span>
        </div>
      </div>
    </div>
  )
}
