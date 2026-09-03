import { useEffect, useRef, useState } from 'react'

/* WebGL2 probe — cached, and the context is released immediately. */
let webgl2 = null
export function supportsWebGL2() {
  if (webgl2 !== null) return webgl2
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    webgl2 = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl2 = false
  }
  return webgl2
}

let webgl1 = null
export function supportsWebGL1() {
  if (webgl1 !== null) return webgl1
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    webgl1 = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webgl1 = false
  }
  return webgl1
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

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

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useIsNarrow = () => useMediaQuery('(max-width: 767px)')

/* Tab visibility — every canvas on the page stops when the tab is hidden. */
export function usePageVisible() {
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
 * Element-in-view flag.
 * `once: true` latches on first intersection (used for the drift-in reveals).
 */
export function useInView({ rootMargin = '0px', threshold = 0, once = false } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, threshold, once])

  return [ref, inView]
}

/* DPR ceiling: 1.25 on phones, 1.5 elsewhere. */
export function dprCap(isNarrow) {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, isNarrow ? 1.25 : 1.5)
}
