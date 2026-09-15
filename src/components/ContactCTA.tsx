import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { site } from '../site'
import { Phone, Instagram, MapPin, Clock } from './Icons'
import { useIsDesktop, useReducedMotion } from '../hooks/useMedia'
import { useWebGL } from '../hooks/useWebGL'

const ShaderBackdrop = lazy(() => import('./ShaderBackdrop'))

export default function ContactCTA() {
  const reduced = useReducedMotion()
  const desktop = useIsDesktop()
  const webgl = useWebGL()
  const ref = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)

  // Only ever pay for the WebGL bundle once the band is close to the viewport.
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const showShader = near && webgl && !reduced && desktop

  return (
    <section className="section cta" id="contact" ref={ref}>
      <div className="cta__bg cta__bg--static" aria-hidden="true" />
      {showShader && (
        <div className="cta__bg" aria-hidden="true">
          <Suspense fallback={null}>
            <ShaderBackdrop />
          </Suspense>
        </div>
      )}

      <div className="wrap cta__inner">
        <div>
          <p className="eyebrow" style={{ color: 'var(--amber-500)' }}>
            Get a free quote
          </p>
          <h2>Tell us about your project</h2>
          <p style={{ margin: '0 auto' }}>
            Call or text and we will book a time to come see it. Quotes are free, written down, and
            there is no obligation to go ahead.
          </p>
        </div>

        <a className="cta__phone" href={site.phoneHref}>
          <Phone size={34} />
          {site.phoneDisplay}
        </a>

        <div className="cta__meta">
          <span>
            <Clock size={16} /> {site.hours}
          </span>
          <span>
            <MapPin size={16} /> {site.serviceArea}
          </span>
        </div>

        <div className="cta__ctas">
          <a className="btn btn--primary" href={site.phoneHref}>
            <Phone size={18} />
            Call Now
          </a>
          <a
            className="btn btn--ghost"
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={18} />
            See more work
          </a>
        </div>
      </div>
    </section>
  )
}
