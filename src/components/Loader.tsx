import { Suspense, lazy, useEffect, useState, type CSSProperties } from 'react'
import { site } from '../site'
import { useReducedMotion } from '../hooks/useMedia'
import { useWebGL } from '../hooks/useWebGL'

const LiquidLogo = lazy(() => import('./LiquidLogo'))

const HOLD_MS = 3000
const FADE_MS = 500
const LOGO = '/assets/logo.jpg'

/**
 * Loading screen. Holds for exactly HOLD_MS, then fades out over FADE_MS.
 *
 * The construction animation is an SVG house frame drawn stroke by stroke
 * (footing -> studs -> roof -> opening). Under prefers-reduced-motion the hold
 * still runs but every stroke renders complete and nothing moves, per WCAG
 * 2.3.3 — the CSS in global.css handles that.
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const [logoOk, setLogoOk] = useState(false)
  const reduced = useReducedMotion()
  const webgl = useWebGL()

  // Only mount the shader if the logo file is actually present, so a missing
  // asset degrades to the wordmark instead of an empty canvas.
  useEffect(() => {
    const img = new Image()
    img.onload = () => setLogoOk(true)
    img.src = LOGO
  }, [])

  useEffect(() => {
    document.body.classList.add('is-locked')
    // Remove the HTML boot loader now that this one is painted underneath it.
    document.getElementById('boot')?.remove()

    // Time the hold from first paint, not from React mount, so the loader is
    // on screen for exactly HOLD_MS regardless of how long the bundle took.
    const bootAt = (window as unknown as { __bootAt?: number }).__bootAt ?? Date.now()
    const remaining = Math.max(0, HOLD_MS - (Date.now() - bootAt))

    const t1 = window.setTimeout(() => setLeaving(true), remaining)
    const t2 = window.setTimeout(() => {
      document.body.classList.remove('is-locked')
      onDone()
    }, remaining + FADE_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      document.body.classList.remove('is-locked')
    }
  }, [onDone])

  const useShader = webgl && !reduced && logoOk

  return (
    <div
      className={`loader${leaving ? ' loader--out' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
    >
      <svg className="loader__frame" viewBox="0 0 120 96" aria-hidden="true" focusable="false">
        {/* footing */}
        <line className="d1" x1="12" y1="88" x2="108" y2="88" style={{ '--len': 96 } as CSSProperties} />
        {/* studs */}
        <polyline
          className="d2"
          points="24,88 24,46 60,18 96,46 96,88"
          style={{ '--len': 210 } as CSSProperties}
        />
        {/* roof */}
        <polyline className="d3" points="14,52 60,16 106,52" style={{ '--len': 130 } as CSSProperties} />
        {/* opening */}
        <path className="d4" d="M50 88 V64 h20 v24" style={{ '--len': 68 } as CSSProperties} />
      </svg>

      <div className="loader__logo">
        {useShader ? (
          <Suspense fallback={<img src={LOGO} alt="" width={230} height={230} />}>
            <LiquidLogo src={LOGO} />
          </Suspense>
        ) : logoOk ? (
          <img src={LOGO} alt="" width={230} height={230} />
        ) : (
          <p className="loader__label" style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.08em' }}>
            {site.legalName}
          </p>
        )}
      </div>

      <div className="loader__bar" aria-hidden="true">
        <i />
      </div>
      <p className="loader__label">{site.name}</p>
      <span className="sr-only">Loading the {site.legalName} website</span>
    </div>
  )
}
