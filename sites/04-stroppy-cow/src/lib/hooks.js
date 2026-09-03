import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './env.js'

/** Element-in-viewport flag. `once` freezes it true after the first entry. */
export function useInView({ rootMargin = '0px', threshold = 0.15, once = false } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin, threshold }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return [ref, inView]
}

/** True while the tab is actually being looked at. */
export function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  )
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

/** Live prefers-reduced-motion, so a mid-session change is respected. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
