import { useEffect, useState } from 'react'
import { LiquidMetal } from '@paper-design/shaders-react'
import Safe from './Safe.jsx'
import { buildWordmarkMask, wordmarkLines } from '../lib/wordmarkMask.js'
import { hasWebGL2, useMediaQuery, usePrefersReducedMotion } from '../lib/env.js'
import { BUSINESS } from '../lib/site.js'

/**
 * LIQUID METAL — the masthead.
 *
 * The shopfront's fascia board carries NICE TO SEE YOU in spaced black
 * capitals. That is the one piece of type the business already owns, so it is
 * the one place a material effect earns its keep: the same words, set in the
 * page's own grotesque, rendered as brushed metal warmed by the espresso amber.
 *
 * The mask is generated on a canvas (white type, transparent ground) — a
 * high-contrast bitmap, which is what the shader wants. No photograph, no
 * invented emblem.
 *
 * Real text is always present underneath for the accessibility tree and for
 * every case where the shader cannot run.
 */
export default function MetalWordmark({ active: onScreen = true }) {
  const wide = useMediaQuery('(min-width: 780px)')
  const reduced = usePrefersReducedMotion()
  const small = useMediaQuery('(max-width: 700px)')
  const [mask, setMask] = useState(null)
  const [failed, setFailed] = useState(false)

  const enabled = hasWebGL2() && !failed
  const lines = wordmarkLines(wide ? 1200 : 400)

  useEffect(() => {
    if (!enabled) return
    let live = true
    buildWordmarkMask(lines)
      .then((result) => {
        if (live) setMask(result)
      })
      .catch(() => {
        if (live) setMask(null)
      })
    return () => {
      live = false
    }
    // `lines` is derived from `wide`; re-cut the mask when the break changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide, enabled])

  const active = Boolean(mask)

  // Remounting would re-run the mask's edge-gradient pre-pass and blink the
  // wordmark, so the canvas stays put and the animation is simply parked when
  // the hero leaves the viewport (ShaderMount does this itself too; being
  // explicit means it also holds while the sticky pill's snapshot runs).
  const speed = reduced || !onScreen ? 0 : 0.28

  const style = mask
    ? {
        '--wm-ar': mask.aspect,
        '--wm-fs': mask.fontPct,
        '--wm-lh': mask.lineHeight,
        '--wm-px': mask.padPct,
      }
    : undefined

  return (
    <h1
      className={`wordmark ${active ? 'is-metal' : ''}`}
      aria-label={BUSINESS.name}
      style={style}
    >
      <span className="wordmark__fallback" aria-hidden="true">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>

      {active ? (
        <span className="wordmark__metal" aria-hidden="true">
          <Safe onFail={() => setFailed(true)}>
            <LiquidMetal
              image={mask.src}
              style={{ width: '100%', height: '100%' }}
              colorBack="#241c14"
              /* near-bone tint: colour-burn keeps the letterforms bright and
                 only warms them, so the wordmark reads as painted signwriting
                 with a sheen, not as a neon outline */
              colorTint="#ffffff"
              speed={speed}
              frame={reduced ? 9000 : 0}
              softness={0.62}
              repetition={5.5}
              shiftRed={0.05}
              shiftBlue={-0.05}
              distortion={0.05}
              contour={0.3}
              angle={96}
              scale={1}
              fit="contain"
              minPixelRatio={1}
              maxPixelCount={small ? 480_000 : 1_100_000}
            />
          </Safe>
        </span>
      ) : null}
    </h1>
  )
}
