import { useEffect, useState } from 'react'
import { BUSINESS } from '../lib/site.js'

const LINKS = [
  ['The shop', '#story'],
  ['The signature', '#signature'],
  ['On the counter', '#counter'],
  ['Visit', '#visit'],
]

export default function Header() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setStuck(window.scrollY > 24)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header on-ink ${stuck ? 'is-stuck' : ''}`}>
      <div className="shell header__inner">
        <a className="header__mark" href="#top">
          {BUSINESS.wordmark}
        </a>

        <nav className="header__nav" aria-label="Sections">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <a className="header__call" href={BUSINESS.phoneHref}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.2 2.5h2.1l1 2.5-1.3.9a7.5 7.5 0 0 0 3.6 3.6l.9-1.3 2.5 1v2.1a1 1 0 0 1-1.1 1A10.5 10.5 0 0 1 2.2 3.6a1 1 0 0 1 1-1.1Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span>Call</span>
        </a>
      </div>
    </header>
  )
}
