'use client'

interface ReadingCardProps {
  content: string
  isLoading?: boolean
  sunSign?: string
  vertical?: string
  timeframe?: string
}

// Convert markdown-ish content to formatted JSX
function formatContent(raw: string): React.ReactNode[] {
  const lines = raw.split('\n')
  const nodes: React.ReactNode[] = []

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="font-display font-semibold text-gold text-sm uppercase tracking-wide mt-5 mb-2 first:mt-0">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.trim()) {
      // Handle **bold**
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-celestial font-semibold">{part.slice(2, -2)}</strong>
        }
        return part
      })
      nodes.push(
        <p key={i} className="text-white/85 text-sm sm:text-base leading-relaxed mb-2">
          {formatted}
        </p>
      )
    }
  })

  return nodes
}

const LOADING_MESSAGES = [
  'Consulting the grahas... ✦',
  'Moon is thinking... 🌙',
  'Checking your dasha... ⭐',
  'Aligning the nakshatras... 🌌',
  'Reading the cosmic scroll... 📜',
]

export function ReadingCard({ content, isLoading, sunSign, vertical, timeframe }: ReadingCardProps) {
  const loadingMsg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]

  if (isLoading) {
    return (
      <div className="glass-card p-5 min-h-[200px] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-white/50 text-sm text-center">{loadingMsg}</p>
        <div className="w-full space-y-2 mt-2">
          {[100, 85, 92, 70, 80].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-white/5 rounded animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="glass-card p-5 min-h-[160px] flex flex-col items-center justify-center gap-3">
        <span className="text-4xl opacity-50">✦</span>
        <p className="text-white/40 text-sm text-center">
          Select a vertical and timeframe to get your reading
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="reading-content">
        {formatContent(content)}
      </div>

      {/* Share / Copy */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <p className="text-white/25 text-xs">
          Nackshatra AI · {sunSign} · {vertical} · {timeframe}
        </p>
        <button
          onClick={() => {
            const shareText = `My ${timeframe} ${vertical} reading (${sunSign}):\n\n${content.replace(/##[^\n]*/g, '').replace(/\*\*/g, '').trim().slice(0, 280)}...\n\nnackshatra.ai`
            if (navigator.share) {
              navigator.share({ text: shareText }).catch(() => {})
            } else {
              navigator.clipboard.writeText(shareText)
            }
          }}
          className="text-white/30 hover:text-teal-400 transition-colors text-xs flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}
