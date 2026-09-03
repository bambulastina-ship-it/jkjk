import { useEffect, useState } from 'react'

/** SSR-safe media query hook. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false
  )

  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

let webgl2Cache = null

/** One-off, cached probe. The context is released immediately. */
export function hasWebGL2() {
  if (webgl2Cache !== null) return webgl2Cache
  if (typeof document === 'undefined') return (webgl2Cache = false)
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    webgl2Cache = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return webgl2Cache
  } catch {
    return (webgl2Cache = false)
  }
}

/** True while the tab is visible. Used to stop every render loop when hidden. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden'
  )
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

/**
 * Intersection state for a ref'd element.
 * `once: true` latches on first entry (used for scroll reveals);
 * `once: false` tracks continuously (used to pause offscreen canvases).
 */
export function useInView(ref, { once = false, rootMargin = '0px', threshold = 0 } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [ref, once, rootMargin, threshold])

  return inView
}

/** Cap device pixel ratio: 1.5 on desktop, 1.25 on small screens. */
export function cappedDpr(isSmall) {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  return Math.min(dpr, isSmall ? 1.25 : 1.5)
}
