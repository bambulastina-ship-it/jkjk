import { useEffect, useRef, useState } from 'react'
import { loadLiquidGlass, destroyGlass } from '../lib/liquidGlass.js'
import { supportsWebGL1 } from '../lib/env.js'

/*
 * Liquid Glass JS (vendored, MIT) with exactly one job: the sticky
 * "Find us at the locks" action that follows you down the page.
 *
 * The accessible control is a real <a> — focusable, 56px tall, with its own
 * solid background. The glass plate is a decorative, pointer-events-free
 * layer behind it, so if WebGL, html2canvas or the vendored scripts fail the
 * button is unchanged.
 */

export default function GlassDock({ href, label, shown, enabled }) {
  const plateRef = useRef(null)
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
      const host = plateRef.current
      if (!host || cancelled) return

      api = await loadLiquidGlass()
      if (cancelled) return

      /*
       * Take the page snapshot ourselves rather than letting the library do
       * it: this way the dock is excluded from its own refraction, and the
       * expensive html2canvas pass happens exactly once.
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
              el.classList?.contains('dock') ||
                el.classList?.contains('glass-container') ||
                el.tagName === 'CANVAS'
            ),
        })
      }
      if (cancelled) return

      const instance = new api.Container({ type: 'pill', borderRadius: 28, tintOpacity: 0.22 })
      instance.element.setAttribute('aria-hidden', 'true')
      host.appendChild(instance.element)
      instance.updateSizeFromDOM()
      instanceRef.current = instance
      setGlassOn(true)

      // one more measure after layout settles (fonts, safe-area insets)
      window.setTimeout(() => instanceRef.current?.updateSizeFromDOM(), 120)
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
      : window.setTimeout(start, 400)

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
    <div className={`dock${shown ? ' is-shown' : ''}${glassOn ? ' is-glass' : ''}`}>
      <div className="dock__inner">
        <div className="dock__glass" ref={plateRef} aria-hidden="true" />
        <a
          className="dock__cta"
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          tabIndex={shown ? 0 : -1}
        >
          {label}
        </a>
      </div>
    </div>
  )
}
