import { useEffect, useRef, useState } from 'react'
import { loadLiquidGlass, destroyGlass } from '../lib/liquidGlass.js'
import { supportsWebGL1 } from '../lib/env.js'

/*
 * Liquid Glass JS (dashersw/liquid-glass-js, vendored, MIT — see
 * public/vendor/liquid-glass-js/LICENSE) with exactly one job: the sticky
 * "Find us in the Shambles" / "Call" tray that appears once you have scrolled
 * past the hero.
 *
 * Both controls are real <a> elements with their own solid backgrounds and
 * 46px tap targets. The glass plate is a decorative, pointer-events-free
 * layer *behind* them, so if WebGL, html2canvas or the vendored scripts fail,
 * the tray is unchanged. It is deliberately kept at the foot of the viewport
 * and never over the menu — prices beat refraction every time.
 */

export default function GlassCta({ mapUrl, phoneHref, phoneLabel, shown, enabled }) {
  const trayRef = useRef(null)
  const instanceRef = useRef(null)
  const [glassOn, setGlassOn] = useState(false)

  useEffect(() => {
    if (!enabled || !shown) return
    if (!supportsWebGL1()) return
    if (instanceRef.current) return

    let cancelled = false
    let api = null
    let resizeTimer
    let lastWidth = window.innerWidth

    const build = async () => {
      const host = trayRef.current
      if (!host || cancelled) return

      api = await loadLiquidGlass()
      if (cancelled) return

      /*
       * Take the page snapshot here rather than letting the library take its
       * own: this keeps the tray out of its own refraction and makes the
       * expensive html2canvas pass happen exactly once per layout.
       */
      if (!api.Container.pageSnapshot) {
        api.Container.pageSnapshot = await window.html2canvas(document.body, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: null,
          ignoreElements: (el) =>
            Boolean(
              el.classList?.contains('sticky-cta') ||
                el.classList?.contains('glass-container') ||
                el.tagName === 'CANVAS'
            ),
        })
      }
      if (cancelled) return

      const instance = new api.Container({ type: 'pill', borderRadius: 999, tintOpacity: 0.24 })
      instance.element.setAttribute('aria-hidden', 'true')
      host.appendChild(instance.element)
      instance.updateSizeFromDOM()
      instanceRef.current = instance
      setGlassOn(true)

      // one more measure once fonts and safe-area insets have settled
      window.setTimeout(() => instanceRef.current?.updateSizeFromDOM(), 140)
    }

    const onResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) < 24) return
      lastWidth = window.innerWidth
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const instance = instanceRef.current
        if (!instance || !api) return
        destroyGlass(instance, api)
        instanceRef.current = null
        setGlassOn(false)
        api.Container.pageSnapshot = null
        build().catch(() => setGlassOn(false))
      }, 500)
    }

    const start = () => build().catch(() => setGlassOn(false))
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 500)

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelled = true
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      if (instanceRef.current) {
        destroyGlass(instanceRef.current, api || {})
        instanceRef.current = null
      }
    }
  }, [enabled, shown])

  return (
    <div
      className={`sticky-cta${shown ? ' is-visible' : ''}${glassOn ? ' is-glass' : ''}`}
      ref={trayRef}
    >
      <a
        className="sticky-cta__link"
        href={mapUrl}
        target="_blank"
        rel="noreferrer noopener"
        tabIndex={shown ? 0 : -1}
      >
        Find us in the Shambles
      </a>
      <a
        className="sticky-cta__call"
        href={phoneHref}
        tabIndex={shown ? 0 : -1}
        aria-label={`Call SoupChick on ${phoneLabel}`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.6 3h3l1.5 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        Call
      </a>
    </div>
  )
}
