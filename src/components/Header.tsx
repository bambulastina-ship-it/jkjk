import logoSrc from '../assets/logo.jpg'
import { useEffect, useState } from 'react'
import { site } from '../site'
import { Phone, Instagram } from './Icons'

const links = [
  { href: '#before-after', label: 'Before & After' },
  { href: '#work', label: 'Our Work' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${compact ? ' header--compact' : ''}`}>
      <div className="wrap header__inner">
        <a className="header__logo" href="#top">
          <img src={logoSrc} alt={`${site.legalName} logo`} width={40} height={40} />
          <span className="header__logo-text">
            Malwa Belt
            <span>Renovations Ltd.</span>
          </span>
        </a>

        <nav className="header__nav" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <a
            className="icon-btn"
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} on Instagram (opens in a new tab)`}
          >
            <Instagram />
          </a>
          <a className="btn btn--primary btn--sm header__call" href={site.phoneHref}>
            <Phone size={18} />
            Call Now
          </a>
          <a
            className="icon-btn header__call-mobile"
            href={site.phoneHref}
            aria-label={`Call ${site.name} at ${site.phoneDisplay}`}
          >
            <Phone />
          </a>
        </div>
      </div>
    </header>
  )
}
