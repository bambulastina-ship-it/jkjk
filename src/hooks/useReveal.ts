import { useEffect } from 'react'

/** Everything is revealed no matter what after this long. */
const FAILSAFE_MS = 4000

/**
 * Adds .is-in to each [data-reveal] element as it scrolls into view.
 *
 * The hidden state lives behind `html.js-anim`, which this hook adds and then
 * always removes after FAILSAFE_MS. So the fade is a pure enhancement: a
 * missed observer callback, a thrown error, or no JS at all leaves the content
 * visible rather than stuck at opacity 0.
 */
export function useReveal(enabled: boolean) {
  useEffect(() => {
    const root = document.documentElement
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!enabled || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'))
      return
    }

    root.classList.add('js-anim')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )
    nodes.forEach((n) => io.observe(n))

    // Anything scrolled past counts as revealed, even if the observer missed it.
    const sweep = () => {
      const limit = window.innerHeight * 1.2
      nodes.forEach((n) => {
        if (!n.classList.contains('is-in') && n.getBoundingClientRect().top < limit) {
          n.classList.add('is-in')
          io.unobserve(n)
        }
      })
    }
    window.addEventListener('scroll', sweep, { passive: true })

    const failsafe = window.setTimeout(() => {
      root.classList.remove('js-anim')
      nodes.forEach((n) => n.classList.add('is-in'))
    }, FAILSAFE_MS)

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', sweep)
      window.clearTimeout(failsafe)
      root.classList.remove('js-anim')
    }
  }, [enabled])
}
