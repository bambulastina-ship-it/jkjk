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
 * WebGL budget: three canvases, none of them ever competing. The Liquid Metal
 * wordmark is a small masthead-sized surface that stays put and is parked when
 * the hero scrolls away; the R3F crema field and the ShaderGradient backdrop
 * are code-split, mounted only while their own section is on screen, and made
 * mutually exclusive below.
 */
export default function App() {
  const heroRef = useRef(null)
  const voicesRef = useRef(null)
  const visitRef = useRef(null)

  const heroInView = useInView(heroRef, { rootMargin: '10% 0px' })
  const heroSeen = useInView(heroRef, { once: true })
  const voicesInView = useInView(voicesRef, { rootMargin: '10% 0px' })
  // Negative margin: the closing panel only counts as "here" once it has
  // genuinely arrived, which keeps it from stealing the section above.
  const visitInView = useInView(visitRef, { rootMargin: '-25% 0px' })

  // The two sections are close enough that both can be on screen at once.
  // Only one heavy canvas ever runs: the closing panel wins, because that is
  // where the reader is heading.
  const cremaActive = voicesInView && !visitInView

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
        <Voices innerRef={voicesRef} active={cremaActive} />
        <Visit innerRef={visitRef} active={visitInView} />
      </main>

      <Footer />

      <GlassVisitPill shown={pillShown} />
    </>
  )
}
