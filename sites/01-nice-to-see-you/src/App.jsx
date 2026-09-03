import { useRef } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Story from './components/Story.jsx'
import BleedBand from './components/BleedBand.jsx'
import Signature from './components/Signature.jsx'
import Counter from './components/Counter.jsx'
import Voices from './components/Voices.jsx'
import Visit from './components/Visit.jsx'
import Footer from './components/Footer.jsx'
import GlassVisitPill from './components/GlassVisitPill.jsx'
import { useInView } from './lib/env.js'

/**
 * Section rhythm, deliberately uneven:
 *
 *   hero (ink, portrait shopfront)  →  story (paper, narrow offset column)
 *   →  full-bleed landscape band    →  two-up (paper-2)
 *   →  two-up reversed (paper)      →  voices (ink, R3F)
 *   →  visit (ink, ShaderGradient)  →  footer
 *
 * WebGL budget: the three heavy canvases live in the hero, the voices section
 * and the visit section, and each is mounted only while its own section is on
 * screen. They are separated by enough page that in practice at most one runs.
 */
export default function App() {
  const heroRef = useRef(null)
  const voicesRef = useRef(null)
  const visitRef = useRef(null)

  const heroInView = useInView(heroRef, { rootMargin: '10% 0px' })
  const heroSeen = useInView(heroRef, { once: true })
  const voicesInView = useInView(voicesRef, { rootMargin: '15% 0px' })
  const visitInView = useInView(visitRef, { rootMargin: '15% 0px' })

  // The sticky action appears once the hero's own buttons have gone, and steps
  // aside again when the closing panel puts the same two actions on screen.
  const pillShown = heroSeen && !heroInView && !visitInView

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main">
        <span id="top" />
        <Hero innerRef={heroRef} active={heroInView} />
        <Story />
        <BleedBand />
        <Signature />
        <Counter />
        <Voices innerRef={voicesRef} active={voicesInView} />
        <Visit innerRef={visitRef} active={visitInView} />
      </main>

      <Footer />

      <GlassVisitPill shown={pillShown} />
    </>
  )
}
