'use client'

import { useEffect, useRef } from 'react'

export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Generate 80 stars at random positions
    const stars = Array.from({ length: 80 }, (_, i) => {
      const star = document.createElement('div')
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.8 ? 2 : 3
      star.className = 'star'
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${0.1 + Math.random() * 0.5};
        --duration: ${2 + Math.random() * 4}s;
        --delay: ${Math.random() * 4}s;
      `
      return star
    })

    stars.forEach(s => container.appendChild(s))
    return () => stars.forEach(s => s.remove())
  }, [])

  return <div ref={containerRef} className="stars-bg" aria-hidden="true" />
}
