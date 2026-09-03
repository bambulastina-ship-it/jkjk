import { useEffect, useRef, useState } from 'react'
import { DIRECTIONS_URL } from '../lib/site.js'
import { hasWebGL2, usePrefersReducedMotion } from '../lib/env.js'

/**
 * LIQUID GLASS JS — one bounded job.
 *
 * The sticky "Visit us" action, and nothing else on the page. The vendored
 * library (dashersw/liquid-glass-js, MIT, copied verbatim into
 * public/vendor/liquid-glass-js/) is imperative and classic-script, so this is
 * the small React wrapper the integration notes ask for: it constructs a
 * Container on mount and tears it down on unmount.
 *
 * Two deliberate departures from the vendor's happy path:
 *
 *  1. We take the html2canvas snapshot ourselves and hand it to the library via
 *     its `Container.pageSnapshot` static, so we can exclude every <canvas> on
 *     the page (WebGL canvases without preserveDrawingBuffer sample as blank
 *     and make html2canvas noisy) and turn its logging off.
 *  2. The glass is a decorative Container sized to the pill; the thing you
 *     actually click is a real <a> on top of it. That keeps native link
 *     semantics, focus and keyboard behaviour, and costs one WebGL context
 *     instead of two.
 *
 * The CSS pill underneath is not a placeholder — it is the design. If WebGL,
 * html2canvas or the snapshot fails, or the visitor prefers reduced motion, the
 * frosted plate is simply what you see.
 */

const VENDOR = `${import.meta.env.BASE_URL}vendor/liquid-glass-js/`
const SCRIPTS = ['container.js', 'button.js', 'expose.js']

function loadOnce(url, tag, attrs) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`${tag}[data-lg="${url}"]`)
    if (existing) {
      if (existing.dataset.ready === '1') resolve()
      else {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error(url)), { once: true })
      }
      return
    }
    const el = document.createElement(tag)
    Object.assign(el, attrs)
    el.dataset.lg = url
    el.addEventListener(
      'load',
      () => {
        el.dataset.ready = '1'
        resolve()
      },
      { once: true }
    )
    el.addEventListener('error', () => reject(new Error(url)), { once: true })
    document.head.appendChild(el)
  })
}

async function loadLibrary() {
  await loadOnce(`${VENDOR}glass.css`, 'link', {
    rel: 'stylesheet',
    href: `${VENDOR}glass.css`,
  })
  for (const file of SCRIPTS) {
    await loadOnce(`${VENDOR}${file}`, 'script', { src: `${VENDOR}${file}`, async: false })
  }
  if (!window.LiquidGlass?.Container) throw new Error('liquid-glass-js did not expose Container')
  return window.LiquidGlass
}

export default function GlassVisitPill({ shown }) {
  const hostRef = useRef(null)
  const [glass, setGlass] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // Only build the glass once the action is actually on screen, and only
    // where it can succeed.
    if (!shown || glass || reduced || !hasWebGL2()) return
    if (document.body.scrollHeight > 20000) return // snapshot would be silly-large

    let container = null
    let cancelled = false
    let resizeTimer = 0

    const snapshot = async (html2canvas) =>
      html2canvas(document.body, {
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#100e0c',
        ignoreElements: (el) =>
          el.tagName === 'CANVAS' ||
          el.classList.contains('glass-container') ||
          el.classList.contains('glass-button') ||
          el.classList.contains('glass-button-text'),
      })

    const build = async () => {
      const [{ default: html2canvas }, lib] = await Promise.all([
        import('html2canvas'),
        loadLibrary(),
      ])
      if (cancelled) return

      window.html2canvas = html2canvas
      const { Container } = lib

      // Hand the library a snapshot on our terms, so it never runs its own.
      Container.pageSnapshot = await snapshot(html2canvas)
      if (cancelled) return

      container = new Container({ type: 'pill', borderRadius: 28, tintOpacity: 0.22 })
      hostRef.current?.appendChild(container.element)
      container.updateSizeFromDOM()
      setGlass(true)

      const onResize = () => {
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(async () => {
          if (cancelled || !container) return
          try {
            Container.pageSnapshot = await snapshot(html2canvas)
            if (cancelled || !container) return
            container.updateSizeFromDOM()
            container.initWebGL()
          } catch {
            /* keep the frame we already have */
          }
        }, 500)
      }

      window.addEventListener('resize', onResize)
      container.__onResize = onResize
    }

    build().catch(() => {
      if (!cancelled) setGlass(false)
    })

    return () => {
      cancelled = true
      window.clearTimeout(resizeTimer)
      if (!container) return

      if (container.__onResize) window.removeEventListener('resize', container.__onResize)

      // The vendor has no destroy(): unhook it by hand. Nulling gl_refs.gl
      // makes its scroll-bound render() a no-op, then we drop the context and
      // the element and de-register the instance.
      const gl = container.gl_refs?.gl
      container.gl_refs = {}
      container.render = () => {}
      try {
        gl?.getExtension('WEBGL_lose_context')?.loseContext()
      } catch {
        /* nothing to release */
      }
      container.element?.remove()
      const all = window.LiquidGlass?.Container?.instances
      if (all) {
        const i = all.indexOf(container)
        if (i > -1) all.splice(i, 1)
      }
      container = null
      setGlass(false)
    }
  }, [shown, glass, reduced])

  return (
    <div className={`glasspill ${shown ? 'is-shown' : ''} ${glass ? 'is-glass' : ''}`}>
      <span className="glasspill__plate" aria-hidden="true" />
      <span className="glasspill__glass" ref={hostRef} aria-hidden="true" />
      <a
        className="glasspill__link"
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={shown ? 0 : -1}
      >
        Visit us
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  )
}
