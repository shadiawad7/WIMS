export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white whitespace-nowrap">
            PLAYER IQ
          </h1>
        <div className="mt-1 flex flex-col items-center">
          <span className="h-[3px] w-16 bg-primary rounded-full mb-2" />
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white glow-text">HUB</span>
        </div>
      </div>
    </div>
  )
}
