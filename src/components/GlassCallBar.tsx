import { useEffect, useRef, useState } from 'react'
import { site } from '../site'
import { Phone } from './Icons'
import { useIsDesktop, useReducedMotion } from '../hooks/useMedia'

/**
 * Floating "Call Now" bar, desktop only, revealed once the hero scrolls away.
 *
 * liquid-glass-js renders a real refraction lens (SVG displacement filters)
 * sized and positioned to match this bar. The bar itself always carries a CSS
 * backdrop-filter underneath, so if the lens never initialises — mobile,
 * reduced motion, an older browser, or a throw — the bar still looks correct.
 */
export default function GlassCallBar() {
  const [shown, setShown] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<{ destroy: () => void; moveTo: (x: number, y: number) => unknown } | null>(null)
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!desktop || reduced || !shown) return
    const bar = barRef.current
    if (!bar) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    import('liquid-glass-js')
      .then(({ LiquidGlass }) => {
        if (cancelled) return
        const rect = bar.getBoundingClientRect()

        const glass = new LiquidGlass({
          // A bounded element is cheap to clone; the whole page would not be.
          background: document.getElementById('hero-band'),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          radius: Math.round(rect.height / 2),
          scale: 14,
          depth: 8,
          curvature: 4,
          convexity: 1,
          chroma: 0.04,
          blur: 4,
          glow: 0.22,
          edge: 0.3,
          tint: 0.12,
          tintColor: '#0b2545',
          draggable: false,
          zIndex: 93,
        })
        glassRef.current = glass as unknown as typeof glassRef.current

        const place = () => {
          const r = bar.getBoundingClientRect()
          glass.moveTo(Math.round(r.left), Math.round(r.top))
        }
        place()
        window.addEventListener('resize', place)
        cleanup = () => {
          window.removeEventListener('resize', place)
          glass.destroy()
        }
      })
      .catch(() => {
        /* CSS backdrop-filter fallback is already in place */
      })

    return () => {
      cancelled = true
      cleanup?.()
      glassRef.current = null
    }
  }, [desktop, reduced, shown])

  return (
    <div className={`callbar${shown ? ' callbar--in' : ''}`} ref={barRef}>
      <span className="callbar__text">
        {site.phoneDisplay}
        <span>Free quotes — {site.serviceArea}</span>
      </span>
      <a className="btn btn--primary btn--sm" href={site.phoneHref}>
        <Phone size={18} />
        Call Now
      </a>
    </div>
  )
}
