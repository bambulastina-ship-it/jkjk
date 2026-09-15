import { useEffect } from 'react'

/**
 * Adds .is-in to every [data-reveal] element as it enters the viewport.
 * Under reduced motion the CSS already renders the final state, so this only
 * ever adds a class — it never hides content that the observer might miss.
 */
export function useReveal(enabled: boolean) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!enabled || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [enabled])
}
