import { useCallback, useEffect, useState } from 'react'
import Loader from './components/Loader'
import Header from './components/Header'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Services from './components/Services'
import Work from './components/Work'
import BeforeAfter from './components/BeforeAfter'
import Process from './components/Process'
import Testimonial from './components/Testimonial'
import ContactCTA from './components/ContactCTA'
import Footer from './components/Footer'
import GlassCallBar from './components/GlassCallBar'
import { useReducedMotion } from './hooks/useMedia'
import { useReveal } from './hooks/useReveal'

export default function App() {
  const [loading, setLoading] = useState(true)
  const reduced = useReducedMotion()
  useReveal(!reduced)

  const onDone = useCallback(() => setLoading(false), [])

  // Move focus to the page heading once the loader clears, so keyboard and
  // screen-reader users start at the top of the real content.
  useEffect(() => {
    if (loading) return
    const h1 = document.querySelector<HTMLElement>('h1')
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }, [loading])

  return (
    <>
      {loading && <Loader onDone={onDone} />}
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <div id="hero-band">
          <Hero />
        </div>
        <TrustStrip />
        <Services />
        <Work />
        <BeforeAfter />
        <Process />
        <Testimonial />
        <ContactCTA />
      </main>
      <Footer />
      <GlassCallBar />
    </>
  )
}
