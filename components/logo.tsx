export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900">PLAYER IQ</h1>
        <span className="mt-1 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 glow-text">HUB</span>
      </div>
    </div>
  )
}
